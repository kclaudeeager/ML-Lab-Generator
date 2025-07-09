// Sample workflow for generating ML labs using the MCP server
// This script demonstrates how to use the tools in sequence

class MLLabWorkflow {
  constructor(mcpClient) {
    this.client = mcpClient;
    this.labData = {};
  }

  async generateCompleteLab(courseInfo) {
    try {
      console.log('🚀 Starting ML Lab Generation Workflow...\n');

      // Step 1: Analyze Requirements
      console.log('📋 Step 1: Analyzing requirements...');
      const requirements = await this.analyzeRequirements(courseInfo);
      console.log('✅ Requirements analyzed\n');

      // Step 2: Generate Lab Outline
      console.log('📝 Step 2: Generating lab outline...');
      const outline = await this.generateOutline(requirements);
      console.log('✅ Lab outline created\n');

      // Step 3: Create Interactive Lab
      console.log('🎯 Step 3: Creating interactive lab...');
      const interactiveLab = await this.createInteractiveLab(outline);
      console.log('✅ Interactive lab generated\n');

      // Step 4: Add Gamification (Optional)
      console.log('🎮 Step 4: Adding gamification...');
      const gamifiedLab = await this.addGamification(interactiveLab);
      console.log('✅ Gamified version created\n');

      // Step 5: Review Quality
      console.log('🔍 Step 5: Reviewing lab quality...');
      const qualityReview = await this.reviewQuality(gamifiedLab);
      console.log('✅ Quality review completed\n');

      // Step 6: Test Effectiveness
      console.log('🧪 Step 6: Testing lab effectiveness...');
      const effectivenessTest = await this.testEffectiveness(gamifiedLab);
      console.log('✅ Effectiveness testing completed\n');

      // Step 7: Generate Assessment Rubric
      console.log('📊 Step 7: Generating assessment rubric...');
      const rubric = await this.generateRubric(gamifiedLab);
      console.log('✅ Assessment rubric created\n');

      // Step 8: Optimize Content
      console.log('⚡ Step 8: Optimizing content...');
      const optimizedLab = await this.optimizeContent(gamifiedLab, qualityReview);
      console.log('✅ Content optimized\n');

      return {
        requirements,
        outline,
        interactiveLab,
        gamifiedLab,
        qualityReview,
        effectivenessTest,
        rubric,
        optimizedLab
      };

    } catch (error) {
      console.error('❌ Error in workflow:', error);
      throw error;
    }
  }

  async analyzeRequirements(courseInfo) {
    return await this.client.callTool('read_requirements', {
      requirements: courseInfo.requirements,
      lesson_topic: courseInfo.topic,
      target_audience: courseInfo.audience || 'complete beginners',
      duration: courseInfo.duration || '2 hours'
    });
  }

  async generateOutline(requirements) {
    return await this.client.callTool('generate_lab_outline', {
      lesson_topic: requirements.lesson_topic,
      requirements_analysis: requirements.content,
      outline_type: 'interactive'
    });
  }

  async createInteractiveLab(outline) {
    return await this.client.callTool('generate_interactive_lab', {
      outline: outline.content,
      interactivity_level: 'high',
      include_code: true,
      reflection_questions: true
    });
  }

  async addGamification(lab) {
    return await this.client.callTool('generate_gamified_lab', {
      base_lab: lab.content,
      gamification_elements: ['points', 'badges', 'challenges', 'achievements'],
      difficulty_progression: 'linear'
    });
  }

  async reviewQuality(lab) {
    return await this.client.callTool('review_lab_quality', {
      lab_content: lab.content,
      review_criteria: ['clarity', 'engagement', 'educational_value', 'technical_accuracy'],
      target_audience: 'beginners'
    });
  }

  async testEffectiveness(lab) {
    return await this.client.callTool('test_lab_effectiveness', {
      lab_content: lab.content,
      test_scenarios: ['beginner_student', 'struggling_student', 'advanced_student'],
      focus_areas: ['instructions_clarity', 'code_functionality', 'learning_objectives']
    });
  }

  async generateRubric(lab) {
    return await this.client.callTool('generate_assessment_rubric', {
      lab_content: lab.content,
      assessment_type: 'formative',
      grading_scale: 'points'
    });
  }

  async optimizeContent(lab, review) {
    return await this.client.callTool('optimize_lab_content', {
      lab_content: lab.content,
      review_feedback: review.content,
      optimization_goals: ['improve_clarity', 'increase_engagement', 'enhance_accessibility']
    });
  }

  // Alternative workflow for project-based labs
  async generateProjectBasedLab(courseInfo) {
    console.log('🚀 Starting Project-Based Lab Generation...\n');

    // Steps 1-2: Same as above
    const requirements = await this.analyzeRequirements(courseInfo);
    const outline = await this.generateOutline(requirements);

    // Step 3: Create Project-Based Lab
    console.log('📁 Creating project-based lab...');
    const projectLab = await this.client.callTool('generate_project_based_lab', {
      outline: outline.content,
      project_theme: courseInfo.projectTheme || 'healthcare',
      complexity_level: 'beginner',
      deliverables: ['analysis_report', 'working_model', 'presentation']
    });

    // Continue with review and optimization
    const qualityReview = await this.reviewQuality(projectLab);
    const optimizedLab = await this.optimizeContent(projectLab, qualityReview);

    return {
      requirements,
      outline,
      projectLab,
      qualityReview,
      optimizedLab
    };
  }

  // Quick lab generation for simple needs
  async generateQuickLab(topic, requirements) {
    console.log(`🚀 Quick Lab Generation for: ${topic}\n`);

    const analysisResult = await this.client.callTool('read_requirements', {
      requirements,
      lesson_topic: topic,
      target_audience: 'beginners',
      duration: '1 hour'
    });

    const outline = await this.client.callTool('generate_lab_outline', {
      lesson_topic: topic,
      requirements_analysis: analysisResult.content,
      outline_type: 'basic'
    });

    const lab = await this.client.callTool('generate_interactive_lab', {
      outline: outline.content,
      interactivity_level: 'medium',
      include_code: true,
      reflection_questions: false
    });

    return lab;
  }

  // Batch generation for multiple topics
  async generateLabSeries(topics, baseRequirements) {
    console.log('🚀 Generating Lab Series...\n');
    
    const results = [];
    
    for (const topic of topics) {
      console.log(`📝 Processing: ${topic}`);
      
      const courseInfo = {
        requirements: baseRequirements,
        topic: topic,
        audience: 'beginners',
        duration: '2 hours'
      };
      
      const lab = await this.generateQuickLab(topic, baseRequirements);
      results.push({
        topic,
        lab
      });
      
      console.log(`✅ ${topic} completed\n`);
    }
    
    return results;
  }
}

// Example usage
async function main() {
  // This would be your MCP client instance
  const mcpClient = {
    callTool: async (toolName, params) => {
      // Your MCP client implementation
      console.log(`Calling tool: ${toolName}`);
      return { content: `Mock result for ${toolName}` };
    }
  };

  const workflow = new MLLabWorkflow(mcpClient);

  // Example 1: Complete lab generation
  const courseInfo = {
    requirements: "Students should understand linear regression concepts, implement basic algorithms, and analyze results",
    topic: "Linear Regression Fundamentals",
    audience: "complete beginners",
    duration: "2 hours"
  };

  try {
    const result = await workflow.generateCompleteLab(courseInfo);
    console.log('🎉 Complete lab generated successfully!');
    console.log('Final result structure:', Object.keys(result));
  } catch (error) {
    console.error('Failed to generate lab:', error);
  }

  // Example 2: Project-based lab
  const projectInfo = {
    ...courseInfo,
    projectTheme: 'healthcare'
  };

  try {
    const projectResult = await workflow.generateProjectBasedLab(projectInfo);
    console.log('🎉 Project-based lab generated successfully!');
  } catch (error) {
    console.error('Failed to generate project lab:', error);
  }

  // Example 3: Quick lab generation
  try {
    const quickLab = await workflow.generateQuickLab(
      "Decision Trees",
      "Basic understanding of classification algorithms"
    );
    console.log('🎉 Quick lab generated successfully!');
  } catch (error) {
    console.error('Failed to generate quick lab:', error);
  }

  // Example 4: Lab series
  const topics = [
    "Linear Regression",
    "Logistic Regression", 
    "Decision Trees",
    "K-Means Clustering",
    "Neural Network Basics"
  ];

  try {
    const series = await workflow.generateLabSeries(
      topics,
      "Introduction to machine learning algorithms for beginners"
    );
    console.log('🎉 Lab series generated successfully!');
    console.log(`Generated ${series.length} labs`);
  } catch (error) {
    console.error('Failed to generate lab series:', error);
  }
}

// Uncomment to run examples
// main();

export { MLLabWorkflow };