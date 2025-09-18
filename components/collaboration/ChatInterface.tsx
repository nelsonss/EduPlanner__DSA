import React, { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';
import { Agent, AgentName, ChatMessage, LessonPlan } from '../../types';
import { INITIAL_CHAT_MESSAGES, INITIAL_AGENTS } from '../../constants';
import { getAgentResponse, refineLessonPlan } from '../../services/geminiService';
import { Send, Bot, User, BrainCircuit, Sliders, BarChartHorizontal, FileEdit, ThumbsUp, ThumbsDown } from 'lucide-react';
import Markdown from 'react-markdown';
import { useLocation, useNavigate } from 'react-router-dom';


interface ChatInterfaceProps {
    agents: Agent[];
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const senderIcons: Record<'user' | AgentName, React.ElementType> = {
    user: User,
    [AgentName.Evaluator]: BrainCircuit,
    [AgentName.Optimizer]: Sliders,
    [AgentName.Analyst]: BarChartHorizontal,
};

/**
 * Determines which AI agent should handle a given prompt based on keywords.
 * This is a client-side heuristic to route the user's request to the most appropriate agent.
 * The logic is ordered by specificity to prevent conflicts.
 * @param prompt The user's input string.
 * @returns The `AgentName` best suited to handle the prompt.
 */
const detectAgent = (prompt: string): AgentName => {
    const lowerCasePrompt = prompt.toLowerCase();

    // Optimizer keywords are highly specific and relate to content creation/modification.
    if (/\b(create|generate|refine|improve|optimizer)\b/.test(lowerCasePrompt)) {
        return AgentName.Optimizer;
    }

    // Evaluator keywords relate to assessing quality. We explicitly exclude "agent feedback"
    // to avoid misrouting a meta-analysis task intended for the Analyst.
    if (/\b(evaluate|evaluator|assess|effectiveness)\b/.test(lowerCasePrompt) && !lowerCasePrompt.includes('agent feedback')) {
        return AgentName.Evaluator;
    }
    
    // Analyst keywords cover student data, patterns, or the specific task of reviewing agent feedback.
    if (/\b(analyst|analyze|student|errors|patterns|review agent feedback)\b/.test(lowerCasePrompt)) {
        return AgentName.Analyst;
    }

    // Fallback: If the prompt mentions common instructional assets but isn't a creation task,
    // it's likely a request for evaluation.
    if (/\b(lesson|quiz|assignment)\b/.test(lowerCasePrompt)) {
        return AgentName.Evaluator;
    }
    
    // Default Case: If no other keywords match, route to the Analyst, which handles general data queries.
    return AgentName.Analyst;
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ agents, setAgents }) => {
    // State for managing the list of chat messages.
    // It's initialized with mock data and transforms the text to a Markdown component for rendering.
    const [messages, setMessages] = useState<ChatMessage[]>(() =>
        INITIAL_CHAT_MESSAGES.map(msg => ({
            ...msg,
            // Store the raw text for functions like feedback logging or refinement prompts.
            rawText: msg.sender !== 'user' && typeof msg.text === 'string' ? msg.text : undefined,
            // Render agent messages through the Markdown component.
            text: msg.sender !== 'user' ? <Markdown>{String(msg.text)}</Markdown> : msg.text,
            // Ensure every agent message has a feedback state ('up', 'down', or null).
            ...(msg.sender !== 'user' && { feedback: msg.feedback !== undefined ? msg.feedback : null }),
        }))
    );
    // State for the user's current input in the text box.
    const [input, setInput] = useState('');
    // State to track which agent is currently "typing" (i.e., processing a request).
    // This is used to show a loading indicator and disable the input form.
    const [isTyping, setIsTyping] = useState<AgentName | null>(null);
    // State to hold a lesson plan that has been sent to the workshop for evaluation.
    // This is necessary for the "refine" workflow.
    const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
    // Ref to the end of the messages list to enable automatic scrolling.
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Helper function to get the default task description for an agent.
    const getInitialTask = (agentName: AgentName): string => {
        const agent = INITIAL_AGENTS.find(a => a.name === agentName);
        return agent ? agent.task : 'Awaiting new prompt.';
    };

    // Function to smoothly scroll the chat window to the latest message.
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // This effect ensures the chat scrolls down whenever new messages are added or when an agent starts typing.
    useEffect(scrollToBottom, [messages, isTyping]);
    
    /**
     * This effect handles incoming data from other pages, specifically a lesson plan
     * sent for review from the Instructional Design Lab. It triggers an automated
     * evaluation prompt in the chat.
     */
    useEffect(() => {
        const lessonPlanForReview: LessonPlan | undefined = location.state?.lessonPlanForReview;
        if (lessonPlanForReview) {
            setActiveLessonPlan(lessonPlanForReview);
            // The display prompt is what the user sees in the chat history.
            const displayPrompt = `Agent Evaluator, please review and provide a CIDPP-based analysis for the following lesson plan:\n\n**Title:** ${lessonPlanForReview.title}`;
            // The full prompt includes the entire JSON object for the AI to analyze.
            const fullPrompt = `Please perform a comprehensive CIDPP analysis on the following lesson plan JSON object and provide structured feedback. Evaluate its clarity, interactivity, difficulty, practicality, and completeness.\n\n${JSON.stringify(lessonPlanForReview, null, 2)}`;
            
            // Trigger the chat submission with the prepared prompts.
            handleExternalPrompt(displayPrompt, AgentName.Evaluator, fullPrompt);

            // Clear the location state to prevent this from re-triggering on a page refresh.
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    /**
     * Handles user feedback (thumbs up/down) on an agent's message.
     * It updates the message's UI state and persists the feedback to localStorage
     * for later analysis by the Analyst agent.
     * @param messageId The ID of the message being rated.
     * @param feedback The rating ('up' or 'down').
     */
    const handleFeedback = (messageId: number, feedback: 'up' | 'down') => {
        let messageToLog: ChatMessage | undefined;
    
        // Update the message in the component's state to reflect the feedback visually.
        setMessages(prevMessages => {
            const newMessages = prevMessages.map(msg => {
                if (msg.id === messageId) {
                    messageToLog = msg; // Capture the full message object for logging.
                    return { ...msg, feedback };
                }
                return msg;
            });
            
            // After identifying the message, log the feedback event to localStorage.
            if (messageToLog && messageToLog.sender !== 'user') {
                const feedbackEntry = {
                    messageId: messageToLog.id,
                    agentName: messageToLog.sender,
                    responseText: messageToLog.rawText || '', // Use the raw text for analysis.
                    feedback,
                    timestamp: new Date().toISOString(),
                };
        
                try {
                    const existingFeedback = JSON.parse(localStorage.getItem('agentFeedback') || '[]');
                    // Prevent duplicate feedback entries if the user clicks multiple times.
                    if (!existingFeedback.find((entry: any) => entry.messageId === messageId)) {
                        localStorage.setItem('agentFeedback', JSON.stringify([...existingFeedback, feedbackEntry]));
                    }
                } catch (e) {
                    console.error("Failed to save feedback to localStorage:", e);
                }
            }
            
            return newMessages;
        });
    };

    /**
     * A specialized version of handleSubmit for prompts that originate from outside
     * the chat input (e.g., sending a lesson plan for review).
     * @param displayText The user-facing text to display for the prompt.
     * @param agent The agent to send the prompt to.
     * @param fullPrompt The complete, detailed prompt for the AI.
     */
    const handleExternalPrompt = async (displayText: string, agent: AgentName, fullPrompt: string) => {
        if (isTyping) return;

        // Add the user's "message" to the chat history.
        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: displayText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMessage]);

        // Set the agent's status to "Processing" and show the typing indicator.
        setIsTyping(agent);
        setAgents(prev => prev.map(a => a.name === agent ? { ...a, status: 'Processing', task: `Analyzing submitted lesson plan...` } : a));

        try {
            // Make the API call via the geminiService.
            const responseText = await getAgentResponse(fullPrompt, agent);
            const agentMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: agent,
                text: <Markdown>{responseText}</Markdown>,
                rawText: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: null,
            };
            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            // Handle API errors gracefully by displaying an error message in the chat.
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
             const agentMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: agent,
                text: <Markdown>{`**Error:** ${errorMessage}`}</Markdown>,
                rawText: `Error: ${errorMessage}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: null,
            };
            setMessages(prev => [...prev, agentMessage]);
        } finally {
             // Reset the agent's status to "Idle" regardless of success or failure.
             setIsTyping(null);
             setAgents(prev => prev.map(a => a.name === agent ? { ...a, status: 'Idle', task: getInitialTask(agent) } : a));
        }
    };

    /**
     * Handles the "Ask Optimizer to act" flow. This is triggered when the user clicks a
     * button within an Evaluator agent's message, tasking the Optimizer to refine a lesson plan.
     * @param feedback The raw text from the Evaluator's message, used as the prompt for the Optimizer.
     */
    const handleOptimizerAction = async (feedback: string) => {
        if (isTyping || !activeLessonPlan) return;
    
        const targetAgent = AgentName.Optimizer;
    
        // Add a message to the chat indicating the user's action.
        const userActionMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: `Tasking Optimizer with the feedback to refine the lesson plan: "${activeLessonPlan.title}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userActionMessage]);
    
        // Set the Optimizer's status to "Processing".
        setIsTyping(targetAgent);
        setAgents(prev => prev.map(a => a.name === targetAgent ? { ...a, status: 'Processing', task: `Refining lesson plan...` } : a));
    
        try {
            // Call the service to refine the lesson plan. This returns a new lesson plan object.
            const refinedPlan = await refineLessonPlan(activeLessonPlan, feedback);
            
            // This handler will be attached to the "View Updated Lesson Plan" button.
            // It navigates the user to the Design Lab, passing the new plan in the route state.
            const handleViewRefinedPlan = () => {
                navigate('/lab', { state: { refinedLessonPlan: refinedPlan } });
            };
    
            // Display a success message from the Optimizer with a button to view the result.
            const agentMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: targetAgent,
                text: (
                    <div>
                        <div className="font-semibold text-brand-dark dark:text-brand-light">Lesson Plan Refined Successfully</div>
                        <p className="mt-1">I have incorporated the evaluator's feedback. You can now view the updated version in the Instructional Design Lab.</p>
                        <button
                            onClick={handleViewRefinedPlan}
                            className="mt-3 flex items-center text-sm font-semibold text-white bg-brand-secondary hover:bg-teal-600 px-3 py-2 rounded-lg transition-colors"
                        >
                            <FileEdit className="w-4 h-4 mr-2" />
                            View Updated Lesson Plan
                        </button>
                    </div>
                ),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: null,
            };
            setMessages(prev => [...prev, agentMessage]);
            // Update the active lesson plan in state so the user can iterate on the refinement.
            setActiveLessonPlan(refinedPlan);
    
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            const agentMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: targetAgent,
                text: <Markdown>{`I encountered an error while refining the lesson plan: ${errorMessage}`}</Markdown>,
                rawText: `Error: ${errorMessage}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: null,
            };
            setMessages(prev => [...prev, agentMessage]);
        } finally {
            // Reset the agent's status.
            setIsTyping(null);
            setAgents(prev => prev.map(a => a.name === targetAgent ? { ...a, status: 'Idle', task: getInitialTask(targetAgent) } : a));
        }
    };


    /**
     * Handles the main form submission when a user sends a message.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        // Add the user's message to the state.
        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Use the detection logic to determine the target agent.
        const targetAgent = detectAgent(input);
        setIsTyping(targetAgent);
        
        const currentInput = input;
        setInput(''); // Clear the input field immediately for a responsive feel.

        // Update the agent's status in the control panel.
        setAgents(prev => prev.map(a => a.name === targetAgent ? { ...a, status: 'Processing', task: `Processing prompt: "${currentInput.slice(0, 30)}..."` } : a));

        try {
            // Asynchronously get the agent's response.
            const responseText = await getAgentResponse(currentInput, targetAgent);
            // Create the agent's message object.
            const agentMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: targetAgent,
                text: <Markdown>{responseText}</Markdown>,
                rawText: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: null,
            };
             setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            // Display any errors from the API call directly in the chat.
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            const agentMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: targetAgent,
                text: <Markdown>{`**Error:** ${errorMessage}`}</Markdown>,
                rawText: `Error: ${errorMessage}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: null,
            };
            setMessages(prev => [...prev, agentMessage]);
        } finally {
            // Reset the agent's status once the process is complete.
            setIsTyping(null);
            setAgents(prev => prev.map(a => a.name === targetAgent ? { ...a, status: 'Idle', task: getInitialTask(targetAgent) } : a));
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Dialogue with AI Agents</h2>
            <div className="flex-1 overflow-y-auto pr-2">
                {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    const Icon = senderIcons[msg.sender] || Bot;
                    // Heuristic to check if an Evaluator's message contains a "recommendation",
                    // which is the trigger to show the "Ask Optimizer" button.
                    const hasRecommendation = !isUser && msg.rawText && msg.sender === AgentName.Evaluator && msg.rawText.toLowerCase().includes('recommendation');

                    return (
                        <div key={index} className={`flex items-start my-4 ${isUser ? 'justify-end' : ''}`}>
                            {!isUser && <Icon className="w-8 h-8 rounded-full p-1 bg-brand-light-accent dark:bg-brand-dark text-brand-primary mr-3 flex-shrink-0" />}
                            <div className="flex flex-col">
                                <div className={`p-3 rounded-lg max-w-lg ${isUser ? 'bg-brand-primary text-white' : 'bg-brand-light-accent dark:bg-brand-dark'}`}>
                                    {/* Render the message content, which could be a string or a React node */}
                                    <div className="prose prose-sm max-w-none dark:prose-invert">{typeof msg.text === 'string' ? <Markdown>{msg.text}</Markdown> : msg.text}</div>
                                    <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>{msg.timestamp}</div>
                                    {/* Conditionally render the "Ask Optimizer" button */}
                                    {hasRecommendation && (
                                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                            <button 
                                                onClick={() => handleOptimizerAction(msg.rawText!)}
                                                className="flex items-center text-sm font-semibold text-brand-primary hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                disabled={!!isTyping || !activeLessonPlan}
                                                title={!activeLessonPlan ? "No active lesson plan to refine" : "Ask Optimizer to act on this feedback"}
                                            >
                                                <Sliders className="w-4 h-4 mr-2" />
                                                Ask Optimizer to act on this feedback
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Feedback buttons for agent messages */}
                                {!isUser && (
                                     <div className="mt-2 flex items-center gap-4 pl-1">
                                         <button
                                             onClick={() => handleFeedback(msg.id, 'up')}
                                             disabled={!!msg.feedback} // Disable after feedback is given
                                             className={`flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 disabled:cursor-not-allowed transition-colors ${msg.feedback === 'up' ? 'text-green-600 font-semibold' : ''}`}
                                             aria-label="Good response"
                                         >
                                             <ThumbsUp className="w-4 h-4" />
                                         </button>
                                         <button
                                             onClick={() => handleFeedback(msg.id, 'down')}
                                             disabled={!!msg.feedback}
                                             className={`flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 disabled:cursor-not-allowed transition-colors ${msg.feedback === 'down' ? 'text-red-600 font-semibold' : ''}`}
                                             aria-label="Bad response"
                                         >
                                             <ThumbsDown className="w-4 h-4" />
                                         </button>
                                         {msg.feedback && <span className="text-xs text-gray-400 italic">Feedback saved.</span>}
                                     </div>
                                 )}
                            </div>
                            {isUser && <Icon className="w-8 h-8 rounded-full p-1 bg-brand-dark-accent text-white ml-3 flex-shrink-0" />}
                        </div>
                    );
                })}
                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-start my-4">
                         <Bot className="w-8 h-8 rounded-full p-1 bg-brand-light-accent dark:bg-brand-dark text-brand-primary mr-3 flex-shrink-0 animate-pulse" />
                         <div className="p-3 rounded-lg bg-brand-light-accent dark:bg-brand-dark">
                            <div className="flex items-center space-x-1">
                                <span className="text-gray-500 dark:text-gray-400">{isTyping} is thinking</span>
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                            </div>
                         </div>
                    </div>
                )}
                {/* Empty div at the end of the list used as a target for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>
            {/* Chat input form */}
            <form onSubmit={handleSubmit} className="mt-4 flex items-center border-t pt-4 border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Converse with an agent (e.g., 'Analyze errors in the Merge Sort submissions')..."
                    className="flex-1 p-3 border rounded-l-lg focus:ring-2 focus:ring-brand-primary focus:outline-none dark:bg-brand-dark dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    disabled={!!isTyping} // Disable input while an agent is processing
                />
                <button type="submit" className="bg-brand-primary text-white p-3 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400" disabled={!!isTyping || !input.trim()}>
                    <Send className="w-6 h-6" />
                </button>
            </form>
        </Card>
    );
};

export default ChatInterface;
