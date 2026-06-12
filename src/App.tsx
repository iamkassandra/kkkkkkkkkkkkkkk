import React, { useState, useRef, useEffect } from "react";
import { 
  Network, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Eye, 
  Edit3, 
  ChevronRight, 
  Brain, 
  Volume2,
  FileCheck,
  Award,
  BookCheck,
  AlertCircle
} from "lucide-react";

interface MindNode {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  parentId?: string;
  isRoot?: boolean;
}

interface Connection {
  sourceId: string;
  targetId: string;
}

interface Flashcard {
  question: string;
  answer: string;
  category: string;
}

interface StatusLog {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
}

export default function App() {
  // Mind Map States
  const [nodes, setNodes] = useState<MindNode[]>([
    {
      id: "ai-root",
      title: "Artificial Intelligence",
      description: "Computational processes simulating cognitive, logical, and adaptive human intelligence.",
      x: 350,
      y: 120,
      isRoot: true,
    },
    {
      id: "ml-concept",
      title: "Machine Learning",
      description: "Statistically mapping algorithms that learn models from complex data sets without strict programming.",
      x: 180,
      y: 280,
      parentId: "ai-root",
    },
    {
      id: "neural-nets",
      title: "Neural Networks",
      description: "Interconnected node architectures modeled inspired by synaptic network transmission in biological brains.",
      x: 520,
      y: 280,
      parentId: "ai-root",
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { sourceId: "ai-root", targetId: "ml-concept" },
    { sourceId: "ai-root", targetId: "neural-nets" }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>("ai-root");
  
  // Custom Topic Builder input
  const [customTopic, setCustomTopic] = useState("");
  const [nodeFilter, setNodeFilter] = useState("");

  // User Workspace States
  const [activeTab, setActiveTab] = useState<"notes" | "flashcards" | "logs">("notes");
  const [notesContent, setNotesContent] = useState<string>(
    `# Artificial Intelligence

**Visual Analogy**: Consider a map of a city that dynamically overlays traffic routes, buildings, and optimal footpaths in response to real-time events. The computer is the surveyor, drawing and redrawing routes based on logic to optimize human travel without needing a permanent guide.

### Key Axioms
- **Heuristics & Search**: AI navigates complex decision trees by finding efficient, approximate pathways (heuristics) rather than brute-forcing all options.
- **Pattern Learning**: Modern neural networks utilize matrix calculations to identify visual and literal recurrences on a massive scale.
- **Syntactic Translation**: Generative logic parses the semantic structures of text to produce coherent output.

### Practical Application
Used in precision autonomous surgical equipment to predict tiny tissue variations or anomalies, assisting surgeons in adjusting micro-strokes on the fly.

> **Did You Know?**
> The term "Artificial Intelligence" was officially popularized in 1956 during a summer conference at Dartmouth College, where researchers spent two months outlining models they thought could be solved in a single summer!`
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      question: "What is the primary difference between AI and traditional software programming?",
      answer: "Traditional programming operates on hardcoded rules and explicit logical paths. Machine learning and AI allow the model to discover hidden parameters, functions, and patterns directly from training data feedback loops.",
      category: "Core Axiom"
    },
    {
      question: "What did the 1956 Dartmouth conference accomplish for theoretical computers?",
      answer: "It formally established the research field of 'Artificial Intelligence'. It gathered pioneers like John McCarthy, Marvin Minsky, and Claude Shannon to outline concepts like symbolic logic processing, neural networks, and automated reasoning.",
      category: "History"
    }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardScores, setFlashcardScores] = useState<Record<number, "easy" | "medium" | "hard">>({});

  // Interaction logs (Academic Notebook Diary)
  const [logs, setLogs] = useState<StatusLog[]>([
    { id: "1", text: "Cognitive Map initialized with AI root.", type: "info", time: "07:18:43" },
    { id: "2", text: "Ready to expand nodes or draft custom study notes.", type: "success", time: "07:19:00" }
  ]);

  // Loading States
  const [isExpandingNode, setIsExpandingNode] = useState(false);
  const [isDraftingNotes, setIsDraftingNotes] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // Dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log state
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Log adding helper
  const addLog = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { id: Math.random().toString(), text, type, time: timeStr }]);
  };

  // Drag Node logic
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Only left click
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Prevent selections and normal behaviors
    e.stopPropagation();
    
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      dragOffset.current = {
        x: clickX - node.x,
        y: clickY - node.y
      };
      setDraggingNodeId(nodeId);
      setSelectedNodeId(nodeId);
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    let targetX = cursorX - dragOffset.current.x;
    let targetY = cursorY - dragOffset.current.y;

    // Clamp values coordinates to keep within safe canvas boundaries
    targetX = Math.max(25, Math.min(rect.width - 25, targetX));
    targetY = Math.max(25, Math.min(rect.height - 25, targetY));

    setNodes(prev => prev.map(node => {
      if (node.id === draggingNodeId) {
        return { ...node, x: targetX, y: targetY };
      }
      return node;
    }));
  };

  const handleMapMouseUpOrLeave = () => {
    setDraggingNodeId(null);
  };

  // Node editing state
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleVal, setEditingTitleVal] = useState("");

  const startEditTitle = (nodeId: string, currentTitle: string) => {
    setEditingTitleId(nodeId);
    setEditingTitleVal(currentTitle);
  };

  const saveEditTitle = (nodeId: string) => {
    if (editingTitleVal.trim()) {
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          return { ...node, title: editingTitleVal.trim() };
        }
        return node;
      }));
      addLog(`Renamed node to "${editingTitleVal.trim()}"`, "info");
    }
    setEditingTitleId(null);
  };

  // Manual element additions
  const handleAddManualNode = () => {
    if (!customTopic.trim()) return;
    const parentNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
    const newId = `node-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: MindNode = {
      id: newId,
      title: customTopic.trim(),
      description: "Custom user-generated sub-concept node.",
      x: parentNode.x + (Math.random() * 80 - 40),
      y: parentNode.y + 120,
      parentId: parentNode.id
    };

    setNodes(prev => [...prev, newNode]);
    setConnections(prev => [...prev, { sourceId: parentNode.id, targetId: newId }]);
    setSelectedNodeId(newId);
    setCustomTopic("");
    addLog(`Manually created new concept: "${newNode.title}"`, "success");
  };

  // Delete node and cleans connections
  const handleDeleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;
    if (nodeToDelete.isRoot) {
      addLog("Cannot delete the root conceptual node.", "warning");
      return;
    }

    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId));
    addLog(`Deleted concept "${nodeToDelete.title}" and its connected lines.`, "info");
    
    // Reset selection to root
    setSelectedNodeId("ai-root");
  };

  // Core API Trigger: Expand Concepts radially around selected node
  const triggerExpandNode = async () => {
    const activeNode = nodes.find(n => n.id === selectedNodeId);
    if (!activeNode) return;

    addLog(`Querying Gemini API to expand "${activeNode.title}"...`, "info");
    setIsExpandingNode(true);

    try {
      const response = await fetch("/api/generate-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeNode.title })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed API request");
      }

      const data = await response.json();
      
      // Plot the returned 4 concepts radially around the parent element
      const radius = 180;
      const indexOffset = Math.random() * 2; // slight shift angle each time
      const newNodesList: MindNode[] = [];
      const newConnections: Connection[] = [];

      if (data.concepts && Array.isArray(data.concepts)) {
        data.concepts.slice(0, 4).forEach((concept: any, index: number) => {
          const angle = (index * (2 * Math.PI / 4)) + indexOffset;
          let nodeX = activeNode.x + Math.round(Math.cos(angle) * radius);
          let nodeY = activeNode.y + Math.round(Math.sin(angle) * radius);

          // Keep coordinates clean inside bounds
          nodeX = Math.max(30, Math.min(670, nodeX));
          nodeY = Math.max(30, Math.min(370, nodeY));

          const createdId = `gemini-node-${concept.id || Math.random().toString()}`;
          
          newNodesList.push({
            id: createdId,
            title: concept.title || "Untitled concept",
            description: concept.description || "Synthesised conceptual parameter.",
            x: nodeX,
            y: nodeY,
            parentId: activeNode.id
          });

          newConnections.push({
            sourceId: activeNode.id,
            targetId: createdId
          });
        });

        setNodes(prev => [...prev, ...newNodesList]);
        setConnections(prev => [...prev, ...newConnections]);
        
        // Pick safety select the first generated node so user sees action
        if (newNodesList.length > 0) {
          setSelectedNodeId(newNodesList[0].id);
        }

        addLog(`Successfully expanded concept map for "${activeNode.title}". Added ${newNodesList.length} sub-concepts.`, "success");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`API Expansion failed: ${err.message || err}`, "error");
    } finally {
      setIsExpandingNode(false);
    }
  };

  // Core API Trigger: Draft rich lesson notes for selected concept
  const triggerDraftLesson = async () => {
    const activeNode = nodes.find(n => n.id === selectedNodeId);
    if (!activeNode) return;

    // Resolve parent name context if it exists
    let parentTopicName = "";
    if (activeNode.parentId) {
      const parent = nodes.find(n => n.id === activeNode.parentId);
      if (parent) parentTopicName = parent.title;
    }

    addLog(`Synthesizing markdown editorial notes for "${activeNode.title}"...`, "info");
    setIsDraftingNotes(true);
    setActiveTab("notes");

    try {
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conceptTitle: activeNode.title,
          parentTopic: parentTopicName || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed API request");
      }

      const data = await response.json();
      if (data.content) {
        setNotesContent(data.content);
        addLog(`Successfully composed scholarly lesson on "${activeNode.title}".`, "success");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Lesson generation failed: ${err.message || err}`, "error");
    } finally {
      setIsDraftingNotes(false);
    }
  };

  // Core API Trigger: Generate dynamic flashcards
  const triggerGenerateFlashcards = async () => {
    // Generate flashcards from current node parameters in workspace
    const conceptsToQuery = nodes.map(n => ({
      title: n.title,
      description: n.description
    }));

    if (conceptsToQuery.length === 0) {
      addLog("Cannot generate flashcards. Conceptual node map is too barren.", "warning");
      return;
    }

    addLog(`Synthesizing custom card questions from active conceptual map...`, "info");
    setIsGeneratingCards(true);
    setActiveTab("flashcards");

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: conceptsToQuery.slice(0, 6) }) // slice to keep token cost optimal
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed card response");
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setFlashcards(data);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
        setFlashcardScores({});
        addLog(`Successfully drafted ${data.length} rigorous learning flashcards!`, "success");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Flashcards generation error: ${err.message || err}`, "error");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Mini elegant Markdown Formatter renderer inside application
  const formatMarkdown = (mdStr: string) => {
    if (!mdStr) return null;
    const lines = mdStr.split("\n");
    let keyIdx = 0;

    return lines.map((line, idx) => {
      keyIdx++;
      // Headers
      if (line.startsWith("# ")) {
        return (
          <h1 key={keyIdx} className="text-3xl font-serif font-semibold text-[#1A191C] mt-6 mb-4 leading-tight border-b border-[#EAE8E4] pb-2">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={keyIdx} className="text-xl font-serif font-medium text-[#1A191C] mt-5 mb-3">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={keyIdx} className="text-lg font-serif font-medium text-[#444246] mt-4 mb-2 italic">
            {line.substring(4)}
          </h3>
        );
      }
      // Blockquotes
      if (line.trim().startsWith(">")) {
        // Strip blockquote character and process nested strongs
        const content = line.replace(/^\s*>\s*/, "").replace(/^\s*\*\*/, "").replace(/\*\*\s*$/, "");
        return (
          <blockquote key={keyIdx} className="border-l-4 border-[#D4AF37] bg-amber-50/20 p-4 pl-5 my-4 italic text-[#635F5E] rounded-r font-serif text-sm leading-relaxed">
            {content}
          </blockquote>
        );
      }
      // Bullet points
      if (line.trim().startsWith("- ")) {
        const baseContent = line.trim().substring(2);
        // Basic parser for nested bold text e.g. - **Bold**: Description
        const boldMatch = baseContent.match(/^\*\*(.*?)\*\*:(.*)/);
        if (boldMatch) {
          return (
            <li key={keyIdx} className="ml-5 list-disc text-[#3F3D3C] leading-relaxed mb-1.5 text-sm">
              <strong className="text-[#1A191C] font-semibold">{boldMatch[1]}</strong>: {boldMatch[2]}
            </li>
          );
        }
        return (
          <li key={keyIdx} className="ml-5 list-disc text-[#3F3D3C] leading-relaxed mb-1.5 text-sm">
            {baseContent}
          </li>
        );
      }
      // Blank paragraphs
      if (!line.trim()) {
        return <div key={keyIdx} className="h-2" />;
      }

      // Normal text parsing bold formatting **Text**
      let formattedText: React.ReactNode = line;
      const textBoldMatch = line.match(/\*\*(.*?)\*\*/g);
      if (textBoldMatch) {
        // Quick bold replacer
        let lastIdx = 0;
        const parts: React.ReactNode[] = [];
        line.split(/\*\*(.*?)\*\*/g).forEach((segment, sIdx) => {
          if (sIdx % 2 === 1) {
            parts.push(<strong key={sIdx} className="font-semibold text-[#1A191C]">{segment}</strong>);
          } else if (segment) {
            parts.push(segment);
          }
        });
        formattedText = parts;
      }

      return (
        <p key={keyIdx} className="text-sm text-[#3F3D3C] leading-relaxed mb-3.5 italic-quotes">
          {formattedText}
        </p>
      );
    });
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  
  // Custom SVG curves for concept connectors
  const renderSVGConnections = () => {
    return connections.map((conn, idx) => {
      const source = nodes.find(n => n.id === conn.sourceId);
      const target = nodes.find(n => n.id === conn.targetId);
      if (!source || !target) return null;

      // Draw elegant mathematical bezier curves instead of linear connectors
      const midX = (source.x + target.x) / 2;
      const dPath = `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;
      
      const isHighlighted = selectedNodeId === source.id || selectedNodeId === target.id;

      return (
        <path
          key={`conn-${idx}`}
          id={`path-${source.id}-${target.id}`}
          d={dPath}
          stroke={isHighlighted ? "#BCA374" : "#E8E6E0"}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          strokeDasharray={isHighlighted ? "none" : conn.sourceId.startsWith("gemini-") ? "4 4" : "none"}
          fill="transparent"
          className="transition-all duration-300"
        />
      );
    });
  };

  const filteredNodes = nodes.filter(node => 
    node.title.toLowerCase().includes(nodeFilter.toLowerCase()) || 
    node.description.toLowerCase().includes(nodeFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1D1B19] font-sans selection:bg-[#EBE5D6] selection:text-[#504A40] flex flex-col">
      {/* Editorial Navigation Masthead Header */}
      <header className="border-b border-[#EAE8E4] px-6 py-4 bg-[#FDFCF9]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1A191C] text-[#FDFCF9] p-2.5 rounded-lg flex items-center justify-center">
              <Brain className="w-5.5 h-5.5 stroke-[1.5]" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight text-[#1A191C]">Aesthetic AI Study Companion</h1>
              <p className="text-xs text-[#8A857C] uppercase tracking-wider font-semibold">Scholarly Workspace & Mind Map</p>
            </div>
          </div>

          {/* Quick status counters */}
          <div className="flex items-center gap-4 text-xs font-semibold text-[#6E6A62]">
            <div className="bg-[#F6F4EF] border border-[#E1DEC9] px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>{nodes.length} Concepts Map</span>
            </div>
            <div className="bg-[#F6F4EF] border border-[#E1DEC9] px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{flashcards.length} Flashcards</span>
            </div>
            <button 
              onClick={triggerGenerateFlashcards}
              className="bg-[#1A191C] hover:bg-[#201F22] text-[#FDFCF9] px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold transition-all border border-transparent shadow-sm text-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesise Quiz</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main split dashboard pane */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Modular Mind Map Concept Sandbox */}
        <section className="lg:col-span-7 flex flex-col bg-white border border-[#EAE8E4] rounded-xl shadow-[0_1px_3px_rgba(26,25,28,0.02)] overflow-hidden h-[620px] lg:h-[700px]">
          <div className="border-b border-[#EAE8E4] px-5 py-3.5 bg-[#FAF9F5] flex items-center justify-between gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#8A857C]" />
              <h2 className="font-serif font-bold text-sm text-[#1A191C]">Interactive Concept Schema Map</h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="search-concepts-input"
                type="text"
                placeholder="Find in map..."
                value={nodeFilter}
                onChange={e => setNodeFilter(e.target.value)}
                className="bg-white border border-[#E2DFD8] text-xs px-2.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#BCA374] w-36 transition-all"
              />
              <span className="text-[10px] text-[#A5A096] uppercase font-bold leading-none hidden sm:inline-block">✦ Drag Nodes to Sort</span>
            </div>
          </div>

          {/* Draggable SVGs interactive map playground */}
          <div 
            id="mind-map-canvas"
            ref={mapContainerRef}
            onMouseMove={handleMapMouseMove}
            onMouseUp={handleMapMouseUpOrLeave}
            onMouseLeave={handleMapMouseUpOrLeave}
            className="flex-1 relative overflow-hidden bg-[#FAF9F6] bg-[radial-gradient(#E8E5DC_1px,transparent_1px)] [background-size:16px_16px] select-none cursor-default"
          >
            {/* SVG Vectors Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {renderSVGConnections()}
            </svg>

            {/* Draggable HTML overlays positioned dynamically */}
            {filteredNodes.map((node) => {
              const isActive = node.id === selectedNodeId;
              const isGeminiNode = node.id.startsWith("gemini-node-");
              return (
                <div
                  key={node.id}
                  id={`node-element-${node.id}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: "translate(-50%, -50%)"
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`absolute w-44 rounded-lg p-3 text-left transition-all cursor-grab active:cursor-grabbing select-none border box-border ${
                    isActive
                      ? "bg-white border-[#BCA374] shadow-[0_4px_12px_rgba(188,163,116,0.12)] ring-1 ring-[#BCA374] z-30"
                      : isGeminiNode 
                        ? "bg-[#FAF7EF]/90 border-[#DFD9CD] text-[#55504A] hover:border-[#BCA374] hover:bg-white z-10"
                        : "bg-white border-[#EAE8E4] text-[#1A191C] hover:border-[#BCA374] z-10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    {editingTitleId === node.id ? (
                      <input
                        id={`edit-title-input-${node.id}`}
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onBlur={() => saveEditTitle(node.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditTitle(node.id);
                          if (e.key === "Escape") setEditingTitleId(null);
                        }}
                        autoFocus
                        className="bg-white border border-[#BCA374] text-xs font-serif font-bold p-0.5 rounded w-full focus:outline-none"
                      />
                    ) : (
                      <h4 className="text-xs font-serif font-bold leading-snug tracking-tight text-[#1A191C] line-clamp-2">
                        {node.title}
                      </h4>
                    )}
                    
                    {!node.isRoot && !editingTitleId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="text-[#BCA374] hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                        title="Delete this element"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-[#7A756D] mt-1.5 leading-relaxed line-clamp-2 select-none pointer-events-none">
                    {node.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-[#AFA99F] pt-2 border-t border-[#F2EFF8]">
                    <span>{node.isRoot ? "ROOT KEY" : isGeminiNode ? "✦ GEMINI" : "USER CONCEPT"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditTitle(node.id, node.title);
                      }}
                      className="text-gray-500 hover:text-[#1A191C]"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Instruction Callout Overlay */}
            <div className="absolute bottom-3 left-3 bg-white/70 backdrop-blur-sm border border-[#E9E6DC] py-1 px-2.5 rounded text-[10px] text-[#7E7970] pointer-events-none font-semibold">
              ↔ Drag to organize • Left-click to select concept
            </div>
          </div>

          {/* Quick Concept Generator Interface Controls */}
          <div className="border-t border-[#EAE8E4] p-4 bg-[#FAF9F5] flex flex-col sm:flex-row items-center gap-3.5">
            <div className="flex-1 w-full">
              <p className="text-[10px] font-bold uppercase text-[#8A857C] tracking-wide mb-1 flex items-center gap-1">
                <span>Extend Current Map Manually</span>
              </p>
              <div className="relative flex rounded bg-white shadow-inner border border-[#E1DEC9] overflow-hidden">
                <input
                  id="add-node-topic-input"
                  type="text"
                  placeholder="Type new custom scientific / academic topic..."
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAddManualNode();
                  }}
                  className="flex-1 px-3 py-1.5 text-xs focus:outline-none"
                />
                <button
                  onClick={handleAddManualNode}
                  className="bg-[#FAF9F5] hover:bg-[#EBE9E2] text-xs px-4 border-l border-[#E1DEC9] transition-colors font-semibold flex items-center gap-1.5 text-[#5A564F] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Node</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto self-end">
              <span className="text-[10px] font-bold uppercase text-[#8A857C] tracking-wide">Selected:</span>
              <div className="bg-white border border-[#E2DFD8] text-xs px-3.5 py-1.5 rounded font-serif font-bold text-[#1A191C] h-8 flex items-center shadow-sm w-full sm:w-48 line-clamp-1 truncate">
                {selectedNode.title}
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Editorial Learning Workspace Canvas */}
        <section className="lg:col-span-5 flex flex-col bg-white border border-[#EAE8E4] rounded-xl shadow-[0_1px_3px_rgba(26,25,28,0.02)] overflow-hidden h-[620px] lg:h-[700px]">
          
          {/* Workspace Tabs controls */}
          <div className="border-b border-[#EAE8E4] bg-[#FAF9F5] flex justify-between items-stretch">
            <div className="flex text-xs font-semibold text-[#8A857C]">
              <button
                id="tab-button-notes"
                onClick={() => setActiveTab("notes")}
                className={`px-5 py-3.5 border-r border-[#EAE8E4] flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-white text-[#1A191C] border-t-2 border-t-[#D4AF37] font-bold"
                    : "hover:bg-[#F2F1EC] hover:text-[#1A191C]"
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#CFA329]" />
                <span>Structured Notes</span>
              </button>
              <button
                id="tab-button-flashcards"
                onClick={() => setActiveTab("flashcards")}
                className={`px-5 py-3.5 border-r border-[#EAE8E4] flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === "flashcards"
                    ? "bg-white text-[#1A191C] border-t-2 border-t-[#D4AF37] font-bold"
                    : "hover:bg-[#F2F1EC] hover:text-[#1A191C]"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>Adaptive Cards</span>
              </button>
              <button
                id="tab-button-logs"
                onClick={() => setActiveTab("logs")}
                className={`px-5 py-3.5 border-r border-[#EAE8E4] flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white text-[#1A191C] border-t-2 border-t-[#D4AF37] font-bold"
                    : "hover:bg-[#F2F1EC] hover:text-[#1A191C]"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Diary Logs</span>
              </button>
            </div>
          </div>

          {/* Tab Viewport Contents */}
          <div className="flex-1 overflow-y-auto p-5 relative bg-[#FCFBF8]">

            {/* Error Banner Callout */}
            {logs.some(l => l.type === "error") && (
              <div className="mb-4 p-3.5 bg-red-50/70 border border-red-200/50 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Last Gemini Call Encountered Issues</h4>
                  <p className="mt-0.5 text-red-700/80">Please ensure you have configured <code className="bg-red-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> within the <strong>Secrets panel</strong> or settings in AI Studio.</p>
                </div>
              </div>
            )}

            {/* Structured Notes Content Tab */}
            {activeTab === "notes" && (
              <div className="flex flex-col h-full">
                
                {/* AI generation triggers for selected node */}
                <div className="bg-[#FAF9F5] border border-[#E9E6DC] rounded-lg p-3.5 mb-5 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-[#5C5952]">Subject: <strong>{selectedNode.title}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="action-btn-expand"
                      onClick={triggerExpandNode}
                      disabled={isExpandingNode}
                      className="bg-[#FAF9F5] hover:bg-[#EBE9E2] disabled:opacity-50 text-[#1A191C] border border-[#E1DEC9] px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Network className={`w-3.5 h-3.5 ${isExpandingNode ? "animate-spin" : ""}`} />
                      <span>{isExpandingNode ? "Expanding..." : "Expand Concept Map ✦"}</span>
                    </button>
                    <button
                      id="action-btn-draft"
                      onClick={triggerDraftLesson}
                      disabled={isDraftingNotes}
                      className="bg-[#1A191C] hover:bg-[#201F22] disabled:opacity-50 text-[#FDFCF9] px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isDraftingNotes ? "animate-spin" : ""}`} />
                      <span>{isDraftingNotes ? "Composing..." : "Draft Lesson Notes ✦"}</span>
                    </button>
                  </div>
                </div>

                {isEditingNotes ? (
                  <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#8A857C] uppercase">Manuscript Editor Mode</label>
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Styled Reading</span>
                      </button>
                    </div>
                    <textarea
                      id="notes-markdown-editor"
                      value={notesContent}
                      onChange={(e) => setNotesContent(e.target.value)}
                      className="flex-1 w-full bg-white border border-[#E1DEC9] text-xs font-mono p-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#BCA374] resize-none leading-relaxed text-[#2C2B29]"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xs uppercase text-[#A09C95] tracking-widest font-bold">Scientific Lesson Text</span>
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="text-xs text-[#6F6B62] font-semibold flex items-center gap-1 hover:text-[#1A191C]"
                      >
                        <Edit3 className="w-3.5 h-3.5 animate-pulse" />
                        <span>Edit Manuscript</span>
                      </button>
                    </div>
                    
                    <article className="prose prose-stone max-w-none text-left">
                      {formatMarkdown(notesContent)}
                    </article>
                  </div>
                )}
              </div>
            )}

            {/* Flashcards Interactive Deck Tab */}
            {activeTab === "flashcards" && (
              <div className="flex flex-col items-center justify-center p-3 text-center">
                
                <div className="w-full text-left mb-5">
                  <span className="text-2xs uppercase text-[#A09C95] tracking-widest font-bold block mb-1">Interactive Evaluation Deck</span>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#6F6B62]">Review and self-evaluate your logical understanding.</p>
                    <button
                      onClick={triggerGenerateFlashcards}
                      disabled={isGeneratingCards}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 px-3 py-1 rounded text-xs text-[#1A191C] font-semibold flex items-center gap-1 transition-all"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingCards ? "animate-spin" : ""}`} />
                      <span>{isGeneratingCards ? "Drafting cards..." : "Regenerate Core Deck"}</span>
                    </button>
                  </div>
                </div>

                {flashcards.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-[#9E9990] gap-2">
                    <Volume2 className="w-8 h-8 opacity-40 text-[#D4AF37]" />
                    <p className="text-sm font-semibold">No active flashcards synthesised.</p>
                    <p className="text-xs max-w-xs text-center">Click the button above to analyze active concept maps and query the model to output custom cards.</p>
                  </div>
                ) : (
                  <div className="w-full max-w-md">
                    {/* Interactive 3D Card flipper */}
                    <div
                      id="flashcard-flipper-container"
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="w-full h-64 cursor-pointer perspective-1000 group relative select-none mb-6"
                    >
                      {/* Card Inner Face */}
                      <div
                        className={`w-full h-full duration-500 rounded-xl border border-[#ECE9E0] transition-all transform-style-3d relative ${
                          isCardFlipped ? "rotate-y-180 bg-neutral-900 border-neutral-800 text-white" : "bg-white text-neutral-900 shadow-[0_2px_8px_rgba(26,25,28,0.02)]"
                        }`}
                      >
                        {/* Front Side */}
                        <div className={`p-6 flex flex-col justify-between h-full backface-hidden ${isCardFlipped ? "opacity-0" : "opacity-100"}`}>
                          <div className="flex justify-between items-center text-[10px] font-bold text-indigo-500 tracking-wide">
                            <span>{flashcards[currentCardIndex]?.category.toUpperCase() || "ACADEMIC CONCEPT"}</span>
                            <span>CARD {currentCardIndex + 1} OF {flashcards.length}</span>
                          </div>
                          
                          <div className="my-auto py-2">
                            <h3 className="text-base font-serif font-bold text-[#1A191C] leading-relaxed">
                              {flashcards[currentCardIndex]?.question}
                            </h3>
                          </div>

                          <div className="text-[10px] text-[#A5A096] uppercase font-bold tracking-wide">
                            ✦ Click Card to Flip & Reveal Answer
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className={`p-6 flex flex-col justify-between h-full backface-hidden transform-rotate-y-180 absolute inset-0 ${isCardFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                          <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 tracking-wide">
                            <span>VERIFIED SCHOLARLY EXPLANATION</span>
                            <span>CARD {currentCardIndex + 1} OF {flashcards.length}</span>
                          </div>

                          <div className="my-auto overflow-y-auto max-h-40 py-2 pr-1 scrollbar-thin text-left">
                            <p className="text-sm leading-relaxed text-zinc-300">
                              {flashcards[currentCardIndex]?.answer}
                            </p>
                          </div>

                          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">
                            ✦ Click Card to Return to Question
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-6 flex gap-1 justify-center">
                      {flashcards.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded transition-all ${
                            idx === currentCardIndex 
                              ? "w-8 bg-[#1A191C]" 
                              : flashcardScores[idx] 
                                ? "w-3 bg-indigo-500" 
                                : "w-3 bg-zinc-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center gap-4">
                      <button
                        id="prev-card-btn"
                        disabled={currentCardIndex === 0}
                        onClick={() => {
                          setCurrentCardIndex(prev => Math.max(0, prev - 1));
                          setIsCardFlipped(false);
                        }}
                        className="px-4 py-2 border border-[#E1DEC9] bg-white rounded text-xs font-semibold text-[#5C5952] hover:bg-[#FAF9F5] disabled:opacity-40 transition-colors"
                      >
                        Previous Card
                      </button>

                      {/* Score Evaluations */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setFlashcardScores(prev => ({ ...prev, [currentCardIndex]: "hard" }));
                            addLog(`Graded Card ${currentCardIndex + 1} as HARD.`, "warning");
                          }}
                          className={`p-1 px-2 text-[10px] font-bold rounded border ${
                            flashcardScores[currentCardIndex] === "hard"
                              ? "bg-red-50 border-red-300 text-red-600"
                              : "bg-white border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                          }`}
                          title="Self evaluation: Hard"
                        >
                          Hard
                        </button>
                        <button
                          onClick={() => {
                            setFlashcardScores(prev => ({ ...prev, [currentCardIndex]: "medium" }));
                            addLog(`Graded Card ${currentCardIndex + 1} as MEDIUM.`, "info");
                          }}
                          className={`p-1 px-2 text-[10px] font-bold rounded border ${
                            flashcardScores[currentCardIndex] === "medium"
                              ? "bg-amber-50 border-amber-300 text-amber-600"
                              : "bg-white border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                          }`}
                          title="Self evaluation: Medium"
                        >
                          Medium
                        </button>
                        <button
                          onClick={() => {
                            setFlashcardScores(prev => ({ ...prev, [currentCardIndex]: "easy" }));
                            addLog(`Graded Card ${currentCardIndex + 1} as EASY.`, "success");
                          }}
                          className={`p-1 px-2 text-[10px] font-bold rounded border ${
                            flashcardScores[currentCardIndex] === "easy"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                              : "bg-white border-zinc-200 text-zinc-500 hover:bg-neutral-50"
                          }`}
                          title="Self evaluation: Easy"
                        >
                          Easy
                        </button>
                      </div>

                      <button
                        id="next-card-btn"
                        disabled={currentCardIndex === flashcards.length - 1}
                        onClick={() => {
                          setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                          setIsCardFlipped(false);
                        }}
                        className="px-4 py-2 border border-[#E1DEC9] bg-white rounded text-xs font-semibold text-[#5C5952] hover:bg-[#FAF9F5] disabled:opacity-40 transition-colors"
                      >
                        Next Card
                      </button>
                    </div>

                    <div className="mt-8 border-t border-dotted border-[#E1DEC9] pt-4 flex items-center justify-between text-[11px] text-[#A29E95]">
                      <span>✦ Review status: <strong>{Object.keys(flashcardScores).length} graded</strong></span>
                      <button 
                        onClick={() => {
                          setFlashcardScores({});
                          addLog("Cleared index card evaluation grading history.", "info");
                        }} 
                        className="text-gray-400 hover:text-black hover:underline"
                      >
                        Reset History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Academic Diary Logs Tab */}
            {activeTab === "logs" && (
              <div className="flex flex-col h-full text-left">
                <div className="mb-4">
                  <span className="text-2xs uppercase text-[#A09C95] tracking-widest font-bold block mb-1">Interactive Telemetry Log</span>
                  <p className="text-xs text-[#6F6B62]">Review detailed background actions and network proxy diagnostics.</p>
                </div>
                
                <div className="flex-1 bg-[#2C2B29] text-zinc-300 p-4 rounded-lg font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[440px]">
                  {logs.map((log) => {
                    const colorMap = {
                      info: "text-zinc-400",
                      success: "text-emerald-400 font-semibold",
                      warning: "text-amber-400 font-semibold",
                      error: "text-red-400 font-bold"
                    };
                    return (
                      <div key={log.id} className="mb-2 border-b border-zinc-800/50 pb-1.5 flex items-start gap-2.5">
                        <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                        <div className={colorMap[log.type]}>
                          <span className="mr-1 shadow-sm uppercase text-[9px] font-sans px-1 rounded bg-black/30 border border-zinc-700/20 leading-none py-0.5">
                            {log.type}
                          </span>
                          <span>{log.text}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}
            
          </div>

          {/* Active study guides help prompt */}
          <div className="border-t border-[#EAE8E4] p-4 bg-[#FAF9F5] text-left">
            <div className="flex items-start gap-3">
              <div className="bg-[#EBECE8] text-[#5A5C54] p-2 rounded-lg shrink-0 mt-0.5">
                <BookCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#1A191C]">Active Concept Workspace Syllabus</h4>
                <p className="text-[11px] text-[#6E6B62] mt-0.5 leading-relaxed">
                  Select a concept in the map like <strong>"{selectedNode.title}"</strong> and click <strong>"Draft Lesson Notes"</strong> or <strong>"Expand Concept Map"</strong> above. Gemini will parse nodes with strict schema filters to write targeted materials.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Elegant, humble journal-footer */}
      <footer className="border-t border-[#EAE8E4] py-5 px-6 bg-[#FAF9F6] text-center text-xs text-[#9E9A90] mt-auto font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 Academic Study Companion Suite. Crafted in Cloud Sandbox Workspace.</p>
          <div className="flex items-center gap-4 font-semibold text-[#8C887E]">
            <a href="#" className="hover:text-black">Terms of Use</a>
            <span>•</span>
            <a href="#" className="hover:text-black">Cognitive Map FAQ</a>
            <span>•</span>
            <span className="text-[11px] font-bold bg-[#E6E4DC] text-[#4A4740] px-2 py-0.5 rounded uppercase">Port 3000 Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
