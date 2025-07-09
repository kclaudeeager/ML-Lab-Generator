# ML Lab Generator MCP Server Setup Guide

## Overview

This MCP server provides comprehensive tools for generating interactive machine learning labs for beginners. It includes features for creating lab outlines, interactive content, gamified experiences, project-based learning, and quality assessment.

## Features

### Core Tools

1. **read_requirements** - Analyze course requirements and learning objectives
2. **generate_lab_outline** - Create comprehensive lab outlines
3. **generate_interactive_lab** - Generate full interactive labs with hands-on activities
4. **generate_gamified_lab** - Create gamified versions with points, badges, and challenges
5. **generate_project_based_lab** - Generate project-based labs with real-world applications
6. **review_lab_quality** - Review and analyze lab quality
7. **test_lab_effectiveness** - Test labs for potential issues
8. **generate_assessment_rubric** - Create assessment rubrics
9. **optimize_lab_content** - Optimize content based on feedback

## Setup Instructions

### Prerequisites

- Node.js 18.0.0 or higher
- Groq API key
- MCP-compatible client (like Claude Desktop)

### Installation

1. **Create project directory:**
   ```bash
   mkdir ml-lab-generator
   cd ml-lab-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install @modelcontextprotocol/sdk groq-sdk
   ```

3. **Set up environment variables:**
   ```bash
   export GROQ_API_KEY="your_groq_api_key_here"
   ```

4. **Save the server code as `server.js`**

5. **Make the server executable:**
   ```bash
   chmod +x server.js
   ```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "ml-lab-generator": {
      "command": "node",
      "args": ["./server.js"],
      "cwd": "/path/to/ml-lab-generator",
      "env": {
        "GROQ_API_KEY": "your_groq_api_key_here"
      }
    }
  }
}
```

## Usage Workflow

### 1. Analyze Requirements

Start by analyzing your course requirements:

```
Use read_requirements with:
- requirements: "Course objectives and learning goals"
- lesson_topic: "Specific ML topic (e.g., Linear Regression)"
- target_audience: "complete beginners"
- duration: "2 hours"
```

### 2. Generate Lab Outline

Create a structured outline:

```
Use generate_lab_outline with:
- lesson_topic: "Your topic"
- requirements_analysis: "Output from step 1"
- outline_type: "interactive" | "gamified" | "project-based"
```

### 3. Generate Lab Content

Choose your preferred lab format:

#### Interactive Lab
```
Use generate_interactive_lab with:
- outline: "Output from step 2"
- interactivity_level: "high"
- include_code: true
- reflection_questions: true
```

#### Gamified Lab
```
Use generate_gamified_lab with:
- base_lab: "Output from interactive lab"
- gamification_elements: ["points", "badges", "challenges"]
- difficulty_progression: "linear"
```

#### Project-Based Lab
```
Use generate_project_based_lab with:
- outline: "Output from step 2"
- project_theme: "healthcare" | "finance" | "entertainment"
- complexity_level: "beginner"
- deliverables: ["analysis report", "working model"]
```

### 4. Review and Test

Quality assurance:

```
Use review_lab_quality with:
- lab_content: "Generated lab content"
- review_criteria: ["clarity", "engagement", "educational_value"]
- target_audience: "beginners"
```

```
Use test_lab_effectiveness with:
- lab_content: "Generated lab content"
- test_scenarios: ["beginner_student", "struggling_student"]
- focus_areas: ["instructions_clarity", "learning_objectives"]
```

### 5. Generate Assessment

Create rubrics:

```
Use generate_assessment_rubric with:
- lab_content: "Generated lab content"
- assessment_type: "formative" | "summative"
- grading_scale: "points" | "letter_grades"
```

### 6. Optimize Content

Improve based on feedback:

```
Use optimize_lab_content with:
- lab_content: "Original content"
- review_feedback: "Feedback from review"
- optimization_goals: ["improve_clarity", "increase_engagement"]
```

## Example Complete Workflow

```bash
# 1. Analyze requirements
read_requirements(
  requirements="Introduce students to supervised learning with linear regression",
  lesson_topic="Linear Regression Fundamentals",
  target_audience="complete beginners",
  duration="2 hours"
)

# 2. Generate outline
generate_lab_outline(
  lesson_topic="Linear Regression Fundamentals",
  requirements_analysis="[output from step 1]",
  outline_type="interactive"
)

# 3. Create interactive lab
generate_interactive_lab(
  outline="[output from step 2]",
  interactivity_level="high",
  include_code=true,
  reflection_questions=true
)

# 4. Add gamification (optional)
generate_gamified_lab(
  base_lab="[output from step 3]",
  gamification_elements=["points", "badges", "challenges"],
  difficulty_progression="linear"
)

# 5. Review quality
review_lab_quality(
  lab_content="[generated lab content]",
  review_criteria=["clarity", "engagement", "educational_value"],
  target_audience="beginners"
)

# 6. Test effectiveness
test_lab_effectiveness(
  lab_content="[generated lab content]",
  test_scenarios=["beginner_student", "struggling_student"],
  focus_areas=["instructions_clarity", "code_functionality"]
)

# 7. Generate assessment rubric
generate_assessment_rubric(
  lab_content="[generated lab content]",
  assessment_type="formative",
  grading_scale="points"
)

# 8. Optimize based on feedback
optimize_lab_content(
  lab_content="[original content]",
  review_feedback="[feedback from review]",
  optimization_goals=["improve_clarity", "increase_engagement"]
)
```

## Advanced Usage Tips

### Customization Options

#### Outline Types
- **basic**: Simple structure with minimal interactivity
- **interactive**: High engagement with hands-on activities
- **gamified**: Game-like elements and progression
- **project-based**: Real-world application focus

#### Interactivity Levels
- **low**: Basic exercises and simple questions
- **medium**: Moderate interaction with code examples
- **high**: Extensive hands-on activities and real-time feedback

#### Gamification Elements
- **points**: Scoring system for activities
- **badges**: Achievement recognition
- **leaderboard**: Competition elements
- **challenges**: Progressive difficulty levels
- **achievements**: Milestone recognition
- **story**: Narrative-driven learning

#### Assessment Types
- **formative**: Ongoing feedback during learning
- **summative**: Final evaluation of learning outcomes
- **peer**: Student-to-student assessment
- **self**: Self-reflection and evaluation

### Best Practices

1. **Start Simple**: Begin with basic outlines and gradually add complexity
2. **Iterative Development**: Use the review and optimize tools frequently
3. **Test Early**: Run effectiveness tests before finalizing content
4. **Target Audience Focus**: Always consider your specific student population
5. **Balance Engagement**: Mix different types of activities to maintain interest
6. **Include Reflection**: Add opportunities for students to connect learning to real-world applications

### Common ML Lab Topics

The server works well with these beginner ML topics:
- Linear Regression
- Logistic Regression
- Decision Trees
- K-Means Clustering
- Neural Network Basics
- Data Preprocessing
- Feature Engineering
- Model Evaluation
- Cross-Validation
- Bias and Variance

### Integration with Learning Management Systems

The generated labs can be easily integrated with:
- Canvas
- Moodle
- Blackboard
- Google Classroom
- Jupyter Notebooks
- Colab

## Troubleshooting

### Common Issues

1. **Groq API Rate Limits**: 
   - Implement delays between requests
   - Use different models for different tools
   - Cache frequently used responses

2. **Content Quality Issues**:
   - Use the review tools before finalizing
   - Test with multiple scenarios
   - Iterate based on feedback

3. **Length Limitations**:
   - Break large labs into smaller sections
   - Use the optimization tool to reduce content
   - Focus on essential concepts

### Performance Optimization

- Use `llama3-8b-8192` for simple tasks
- Use `llama3-70b-8192` for complex content generation
- Implement caching for repeated requests
- Process labs in sections for better performance

## Example Lab Topics and Themes

### Project Themes by Domain
- **Healthcare**: Disease prediction, medical image analysis
- **Finance**: Stock prediction, fraud detection
- **Entertainment**: Recommendation systems, content analysis
- **Environmental**: Climate modeling, pollution monitoring
- **Sports**: Performance analysis, outcome prediction
- **Social Media**: Sentiment analysis, trend detection

### Complexity Progression
- **Beginner**: Basic concepts, simple datasets, guided exercises
- **Intermediate**: Multiple algorithms, real datasets, open-ended problems
- **Advanced**: Complex projects, research-like activities, original analysis

## Support and Maintenance

### Updating the Server
- Monitor Groq API changes
- Update dependencies regularly
- Test with new model versions
- Gather user feedback for improvements

### Logging and Monitoring
- Add logging for debugging
- Monitor API usage and costs
- Track lab generation success rates
- Collect user satisfaction metrics

## Contributing

To extend the server:
1. Add new tools following the existing pattern
2. Update the tool list in `setupToolHandlers()`
3. Implement the tool logic with proper error handling
4. Test with various inputs and scenarios
5. Update this documentation

## License

MIT License - feel free to modify and distribute as needed.

## Contact

For questions or support, please refer to the MCP documentation or Groq API documentation for specific technical issues.