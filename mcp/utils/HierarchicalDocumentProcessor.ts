import { MLLabGenerator } from "../server.js";

// Enhanced document processing with hierarchical summarization
export class HierarchicalDocumentProcessor {
  private generator: MLLabGenerator;
  private maxChunkSize: number = 3000; // Larger chunks for better context
  private overlapSize: number = 500;   // Overlap between chunks
  private maxTokens: number = 8000;    // Model context limit

  constructor(generator: MLLabGenerator) {
    this.generator = generator;
  }

  /**
   * Process document using hierarchical approach with overlap
   */
  async processDocument(text: string): Promise<{
    sections: DocumentSection[];
    finalSummary: string;
    keyPoints: string[];
    structure: DocumentStructure;
  }> {
    // 1. Intelligent document segmentation
    const sections = this.intelligentSegmentation(text);
    
    // 2. Process each section with context
    const processedSections = await this.processSectionsWithContext(sections);
    
    // 3. Create hierarchical summary
    const hierarchicalSummary = await this.createHierarchicalSummary(processedSections);
    
    // 4. Extract key points and structure
    // Aggregate key concepts from all sections as key points
    const keyPointsArrays = await Promise.all(processedSections.map(s => this.extractKeyConcepts(s.content)));
    const keyPoints = Array.from(new Set(keyPointsArrays.flat()));
    const structure = this.analyzeDocumentStructure(processedSections);
    
    return {
      sections: processedSections,
      finalSummary: hierarchicalSummary,
      keyPoints,
      structure
    };
  }

  /**
   * Intelligent document segmentation based on content structure
   */
  private intelligentSegmentation(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Split by clear section markers first
    const sectionMarkers = [
      /^#{1,6}\s+(.+)$/gm,  // Markdown headers
      /^(\d+\.?\s+.+)$/gm,  // Numbered sections
      /^([A-Z][A-Z\s]+:)/gm, // ALL CAPS headers
      /\n\n(.{0,100})\n\n/g  // Paragraph breaks
    ];
    
    let currentSection: DocumentSection = {
      title: 'Introduction',
      content: '',
      type: 'content',
      level: 1,
      startIndex: 0,
      endIndex: 0
    };
    
    const lines = text.split('\n');
    let currentContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for section headers
      const headerMatch = line.match(/^#{1,6}\s+(.+)$/) || 
                         line.match(/^(\d+\.?\s+.+)$/) ||
                         line.match(/^([A-Z][A-Z\s]+:)/);
      
      if (headerMatch && currentContent.length > 100) {
        // End current section
        currentSection.content = currentContent.trim();
        currentSection.endIndex = i;
        sections.push(currentSection);
        
        // Start new section
        currentSection = {
          title: headerMatch[1] || 'Section',
          content: '',
          type: 'content',
          level: this.getHeaderLevel(line),
          startIndex: i,
          endIndex: i
        };
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
      
      // Handle large sections by splitting on natural boundaries
      if (currentContent.length > this.maxChunkSize) {
        const splitPoint = this.findNaturalSplitPoint(currentContent);
        if (splitPoint > 0) {
          currentSection.content = currentContent.substring(0, splitPoint);
          currentSection.endIndex = i;
          sections.push(currentSection);
          
          currentSection = {
            title: `${currentSection.title} (continued)`,
            content: '',
            type: 'content',
            level: currentSection.level,
            startIndex: i,
            endIndex: i
          };
          currentContent = currentContent.substring(splitPoint - this.overlapSize);
        }
      }
    }
    
    // Add final section
    if (currentContent.trim()) {
      currentSection.content = currentContent.trim();
      currentSection.endIndex = lines.length;
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Process sections with preceding context for coherence
   */
  private async processSectionsWithContext(sections: DocumentSection[]): Promise<DocumentSection[]> {
    const processedSections: DocumentSection[] = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Build context from previous sections
      const context = this.buildContext(sections, i);
      
      // Summarize with context
      const summary = await this.summarizeWithContext(section.content, context);
      
      // Extract key concepts
      const keyConcepts = await this.extractKeyConcepts(section.content);
      
      processedSections.push({
        ...section,
        summary,
        keyConcepts,
        context: context.summary
      });
    }
    
    return processedSections;
  }

  /**
   * Build context from previous sections
   */
  private buildContext(sections: DocumentSection[], currentIndex: number): DocumentContext {
    const contextSections = sections.slice(Math.max(0, currentIndex - 2), currentIndex);
    const summary = contextSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n');
    
    return {
      summary,
      previousTitles: contextSections.map(s => s.title),
      documentType: this.inferDocumentType(sections[0]?.content || ''),
      currentPosition: `Section ${currentIndex + 1} of ${sections.length}`
    };
  }

  /**
   * Summarize section with context awareness
   */
  private async summarizeWithContext(content: string, context: DocumentContext): Promise<string> {
    const prompt = `
Context: ${context.summary}
Document Type: ${context.documentType}
Position: ${context.currentPosition}

Summarize the following section while maintaining coherence with the context:
${content}

Focus on:
- Key concepts and definitions
- Important relationships to previous sections
- Main arguments or findings
- Actionable information
`;

    const result = await this.generator.summarizeChunk({ text: prompt });
    return result.content[0].text || '';
  }

  /**
   * Extract key concepts from content
   */
  private async extractKeyConcepts(content: string): Promise<string[]> {
    const prompt = `Extract 3-5 key concepts, terms, or topics from this text. Return only the concepts, one per line:

${content}`;

    const result = await this.generator.summarizeChunk({ text: prompt });
    return result.content[0].text?.split('\n').filter((line: string) => line.trim()) || [];
  }

  /**
   * Create hierarchical summary maintaining document structure
   */
  private async createHierarchicalSummary(sections: DocumentSection[]): Promise<string> {
    const sectionSummaries = sections.map(s => 
      `## ${s.title}\n${s.summary}\nKey concepts: ${s.keyConcepts?.join(', ')}`
    ).join('\n\n');

    const prompt = `Create a comprehensive summary of this document that maintains its logical structure:

${sectionSummaries}

Provide:
1. Executive summary (2-3 sentences)
2. Main sections and their key points
3. Important relationships between sections
4. Conclusion and implications
`;

    const result = await this.generator.summarizeChunk({ text: prompt });
    return result.content[0].text || '';
  }

  /**
   * Utility methods
   */
  private getHeaderLevel(line: string): number {
    const hashMatch = line.match(/^#{1,6}/);
    if (hashMatch) return hashMatch[0].length;
    
    const numberMatch = line.match(/^(\d+)\./);
    if (numberMatch) return parseInt(numberMatch[1]) > 9 ? 3 : 2;
    
    return 1;
  }

  private findNaturalSplitPoint(content: string): number {
    const sentences = content.split(/[.!?]\s+/);
    let length = 0;
    let splitPoint = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      length += sentences[i].length;
      if (length > this.maxChunkSize * 0.8) {
        splitPoint = length;
        break;
      }
    }
    
    return splitPoint;
  }

  private inferDocumentType(content: string): string {
    if (content.includes('class') && content.includes('def')) return 'code';
    if (content.includes('Introduction') || content.includes('Abstract')) return 'academic';
    if (content.includes('Requirements') || content.includes('Specification')) return 'technical';
    return 'general';
  }

  private analyzeDocumentStructure(sections: DocumentSection[]): DocumentStructure {
    return {
      totalSections: sections.length,
      hasHierarchy: sections.some(s => s.level > 1),
      mainTopics: sections.filter(s => s.level === 1).map(s => s.title),
      documentType: this.inferDocumentType(sections[0]?.content || ''),
      estimatedReadingTime: Math.ceil(sections.reduce((acc, s) => acc + s.content.length, 0) / 1000)
    };
  }
}

// Type definitions
interface DocumentSection {
  title: string;
  content: string;
  type: 'content' | 'header' | 'code' | 'list';
  level: number;
  startIndex: number;
  endIndex: number;
  summary?: string;
  keyConcepts?: string[];
  context?: string;
}

interface DocumentContext {
  summary: string;
  previousTitles: string[];
  documentType: string;
  currentPosition: string;
}

interface DocumentStructure {
  totalSections: number;
  hasHierarchy: boolean;
  mainTopics: string[];
  documentType: string;
  estimatedReadingTime: number;
}