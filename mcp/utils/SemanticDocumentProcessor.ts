import { MLLabGenerator } from "../server.js";
// Semantic chunking using sentence embeddings
export class SemanticDocumentProcessor {
  private generator: MLLabGenerator;
  private maxChunkSize: number = 4000;
  private semanticThreshold: number = 0.7; // Similarity threshold

  constructor(generator: MLLabGenerator) {
    this.generator = generator;
  }

  /**
   * Process document using semantic chunking
   */
  async processDocumentSemantically(text: string): Promise<{
    semanticChunks: SemanticChunk[];
    documentMap: DocumentMap;
    finalSummary: string;
  }> {
    // 1. Split into sentences
    const sentences = this.splitIntoSentences(text);
    
    // 2. Create semantic chunks
    const semanticChunks = await this.createSemanticChunks(sentences);
    
    // 3. Create document map
    const documentMap = this.createDocumentMap(semanticChunks);
    
    // 4. Generate final summary
    const finalSummary = await this.generateFinalSummary(semanticChunks, documentMap);
    
    return {
      semanticChunks,
      documentMap,
      finalSummary
    };
  }

  /**
   * Split text into sentences with context preservation
   */
  private splitIntoSentences(text: string): Sentence[] {
    const sentences: Sentence[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    
    let globalIndex = 0;
    
    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const paragraph = paragraphs[pIndex];
      const sentenceMatches = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      for (const sentenceText of sentenceMatches) {
        if (sentenceText.trim()) {
          sentences.push({
            text: sentenceText.trim(),
            index: globalIndex++,
            paragraphIndex: pIndex,
            length: sentenceText.length
          });
        }
      }
    }
    
    return sentences;
  }

  /**
   * Create semantic chunks based on topic similarity
   */
  private async createSemanticChunks(sentences: Sentence[]): Promise<SemanticChunk[]> {
    const chunks: SemanticChunk[] = [];
    let currentChunk: SemanticChunk = {
      id: 'chunk_0',
      sentences: [],
      topic: '',
      summary: '',
      length: 0,
      semanticScore: 0
    };
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      
      // Check if sentence fits in current chunk
      if (currentChunk.length + sentence.length > this.maxChunkSize && currentChunk.sentences.length > 0) {
        // Finalize current chunk
        currentChunk.topic = await this.extractTopic(currentChunk.sentences);
        currentChunk.summary = await this.summarizeChunk(currentChunk.sentences);
        chunks.push(currentChunk);
        
        // Start new chunk with overlap
        const overlapSentences = currentChunk.sentences.slice(-2); // Keep last 2 sentences
        currentChunk = {
          id: `chunk_${chunks.length}`,
          sentences: overlapSentences,
          topic: '',
          summary: '',
          length: overlapSentences.reduce((acc, s) => acc + s.length, 0),
          semanticScore: 0
        };
      }
      
      currentChunk.sentences.push(sentence);
      currentChunk.length += sentence.length;
    }
    
    // Finalize last chunk
    if (currentChunk.sentences.length > 0) {
      currentChunk.topic = await this.extractTopic(currentChunk.sentences);
      currentChunk.summary = await this.summarizeChunk(currentChunk.sentences);
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  /**
   * Extract topic from sentences
   */
  private async extractTopic(sentences: Sentence[]): Promise<string> {
    const combinedText = sentences.map(s => s.text).join(' ');
    const prompt = `Extract the main topic or theme from this text in 3-5 words:

${combinedText}`;

    const result = await this.generator.summarizeChunk({ text: prompt });
    return result.content[0].text?.split('\n')[0] || 'General Topic';
  }

  /**
   * Summarize chunk of sentences
   */
  private async summarizeChunk(sentences: Sentence[]): Promise<string> {
    const combinedText = sentences.map(s => s.text).join(' ');
    const result = await this.generator.summarizeChunk({ text: combinedText });
    return result.content[0].text || '';
  }

  /**
   * Create document map showing relationships
   */
  private createDocumentMap(chunks: SemanticChunk[]): DocumentMap {
    const topics = chunks.map(c => c.topic);
    const relationships = this.findTopicRelationships(topics);
    
    return {
      totalChunks: chunks.length,
      topics,
      relationships,
      flowStructure: this.createFlowStructure(chunks)
    };
  }

  /**
   * Find relationships between topics
   */
  private findTopicRelationships(topics: string[]): TopicRelationship[] {
    const relationships: TopicRelationship[] = [];
    
    for (let i = 0; i < topics.length - 1; i++) {
      const similarity = this.calculateTopicSimilarity(topics[i], topics[i + 1]);
      relationships.push({
        from: topics[i],
        to: topics[i + 1],
        strength: similarity,
        type: similarity > 0.7 ? 'continuation' : 'transition'
      });
    }
    
    return relationships;
  }

  /**
   * Calculate topic similarity (simplified)
   */
  private calculateTopicSimilarity(topic1: string, topic2: string): number {
    const words1 = topic1.toLowerCase().split(/\s+/);
    const words2 = topic2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Create flow structure
   */
  private createFlowStructure(chunks: SemanticChunk[]): FlowNode[] {
    return chunks.map((chunk, index) => ({
      id: chunk.id,
      topic: chunk.topic,
      position: index,
      connections: index < chunks.length - 1 ? [chunks[index + 1].id] : [],
      importance: this.calculateImportance(chunk)
    }));
  }

  /**
   * Calculate chunk importance
   */
  private calculateImportance(chunk: SemanticChunk): number {
    // Simple heuristic: longer chunks with more unique words are more important
    const uniqueWords = new Set(
      chunk.sentences
        .map(s => s.text.toLowerCase().split(/\s+/))
        .flat()
        .filter(word => word.length > 3)
    );
    
    return Math.min(1, uniqueWords.size / 50 + chunk.length / 10000);
  }

  /**
   * Generate final summary using semantic understanding
   */
  private async generateFinalSummary(chunks: SemanticChunk[], documentMap: DocumentMap): Promise<string> {
    const chunkSummaries = chunks.map(chunk => 
      `**${chunk.topic}**: ${chunk.summary}`
    ).join('\n\n');
    
    const prompt = `Create a comprehensive summary of this document based on its semantic structure:

Document Topics: ${documentMap.topics.join(' → ')}
Total Sections: ${documentMap.totalChunks}

Section Summaries:
${chunkSummaries}

Provide:
1. Main theme and purpose
2. Key topics and their relationships
3. Important conclusions
4. Logical flow of the document
`;

    const result = await this.generator.summarizeChunk({ text: prompt });
    return result.content[0].text || '';
  }
}

// Type definitions
interface Sentence {
  text: string;
  index: number;
  paragraphIndex: number;
  length: number;
}

interface SemanticChunk {
  id: string;
  sentences: Sentence[];
  topic: string;
  summary: string;
  length: number;
  semanticScore: number;
}

interface DocumentMap {
  totalChunks: number;
  topics: string[];
  relationships: TopicRelationship[];
  flowStructure: FlowNode[];
}

interface TopicRelationship {
  from: string;
  to: string;
  strength: number;
  type: 'continuation' | 'transition';
}

interface FlowNode {
  id: string;
  topic: string;
  position: number;
  connections: string[];
  importance: number;
}