import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ArgoFloat, ArgoProfile } from '../types/argo';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  floats: ArgoFloat[];
  profiles: ArgoProfile[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ floats, profiles }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I can help you analyze ARGO oceanographic data. Try asking me questions like:\n\n• "How many active floats are in the dataset?"\n• "Show me temperature profiles from the last month"\n• "What\'s the average salinity at 500m depth?"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processQuery = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    // Simple keyword-based responses (in a real system, this would use LLMs)
    if (lowercaseQuery.includes('active float') || lowercaseQuery.includes('how many float')) {
      const activeFloats = floats.filter(f => f.status === 'active').length;
      const totalFloats = floats.length;
      return `There are ${activeFloats} active floats out of ${totalFloats} total floats in the dataset. The active floats are currently collecting oceanographic data including temperature, salinity, and biogeochemical parameters.`;
    }
    
    if (lowercaseQuery.includes('temperature') && (lowercaseQuery.includes('average') || lowercaseQuery.includes('mean'))) {
      const allTemps = profiles.flatMap(p => p.measurements.map(m => m.temperature));
      const avgTemp = allTemps.reduce((a, b) => a + b, 0) / allTemps.length;
      return `The average temperature across all measurements is ${avgTemp.toFixed(2)}°C. Temperature varies significantly with depth, ranging from surface waters around 25°C to deep waters below 5°C at 2000m depth.`;
    }
    
    if (lowercaseQuery.includes('salinity') && lowercaseQuery.includes('500')) {
      const measurementsAt500m = profiles.flatMap(p => 
        p.measurements.filter(m => Math.abs(m.depth - 500) < 50)
      );
      const avgSalinity = measurementsAt500m.reduce((a, b) => a + b.salinity, 0) / measurementsAt500m.length;
      return `The average salinity at approximately 500m depth is ${avgSalinity.toFixed(2)} PSU (Practical Salinity Units). This represents typical intermediate water characteristics in the Indian Ocean.`;
    }
    
    if (lowercaseQuery.includes('oxygen') || lowercaseQuery.includes('bgc')) {
      const oxygenMeasurements = profiles.flatMap(p => 
        p.measurements.filter(m => m.oxygen !== undefined)
      ).length;
      return `There are ${oxygenMeasurements} dissolved oxygen measurements in the dataset. BGC-Argo floats also measure parameters like chlorophyll, pH, and nitrate to study ocean biogeochemistry and marine ecosystems.`;
    }
    
    if (lowercaseQuery.includes('depth') || lowercaseQuery.includes('deep')) {
      const maxDepth = Math.max(...profiles.flatMap(p => p.measurements.map(m => m.depth)));
      return `The maximum profiling depth in the dataset is ${Math.round(maxDepth)}m. Most ARGO floats profile to 2000m depth, collecting measurements every 10 days as they cycle between the surface and deep ocean.`;
    }
    
    if (lowercaseQuery.includes('location') || lowercaseQuery.includes('where') || lowercaseQuery.includes('indian ocean')) {
      return `The ARGO floats in this dataset are distributed across the Indian Ocean, covering latitudes from 60°S to 30°N and longitudes from 20°E to 120°E. This includes key regions like the Arabian Sea, Bay of Bengal, and Southern Ocean sectors.`;
    }
    
    // Default response
    return `I understand you're asking about "${query}". While I can provide general information about the ARGO dataset, a full natural language processing system would use advanced LLMs to interpret your query and generate SQL queries against the oceanographic database. \n\nCurrently, the dataset contains ${floats.length} floats with ${profiles.length} profiles. Try asking about active floats, temperature averages, or salinity measurements!`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate processing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: processQuery(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-96">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          ARGO Data Assistant
        </h3>
        <p className="text-sm text-gray-600">
          Ask questions about the oceanographic data
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about ARGO data..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};