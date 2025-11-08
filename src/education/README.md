# Educational Features

This directory contains educational components for the TDS Web Simulation.

## Components

### 1. GuidedTour.ts
Provides thematic guided tours through different aspects of TDS theory:
- Symmetry Basics
- Anomaly Dynamics
- Time Reversibility
- Energy Conservation
- Physics Problems

### 2. MultimediaTutorial.ts
Comprehensive tutorial system supporting multiple content formats:
- **Text Tutorials**: Rich HTML content with explanations
- **Video Tutorials**: Video player with chapters and subtitles
- **Interactive Demos**: Hands-on simulation demonstrations
- **Animated Demos**: Step-by-step animated explanations

#### Features:
- Progress tracking and persistence
- Difficulty levels (beginner, intermediate, advanced)
- Navigation between tutorials
- Completion tracking
- Responsive design

#### Usage:
```typescript
import { MultimediaTutorial } from './education/MultimediaTutorial.js';

const tutorial = new MultimediaTutorial();

// Open a specific tutorial
tutorial.open('intro-tds');

// Get all tutorials
const allTutorials = tutorial.getTutorials();

// Get tutorials by difficulty
const beginnerTutorials = tutorial.getTutorialsByDifficulty('beginner');

// Check progress
const progress = tutorial.getProgress('intro-tds');
```

## Integration with Main Application

### Beginner/Expert Mode
The InfoPanel component now includes a beginner/expert mode toggle that:
- Adjusts UI complexity based on user expertise
- Shows/hides advanced features
- Modifies tooltip detail levels
- Persists preference in localStorage

The mode can be accessed via Settings tab in the Info Panel.

### Real-Time Annotations
The AnnotationSystem automatically detects and displays significant simulation events:
- Anomaly spikes
- Energy changes
- Symmetry transitions
- System equilibrium
- Cascading effects
- Oscillating patterns

#### Features:
- Natural language descriptions
- Priority-based display
- Automatic cleanup
- Configurable thresholds
- Enable/disable toggle

#### Usage:
```typescript
import { AnnotationSystem } from './ui/AnnotationSystem.js';

const annotations = new AnnotationSystem();

// Analyze simulation state
annotations.analyzeState(currentSimulationState);

// Enable/disable
annotations.setEnabled(true);

// Add custom annotation
annotations.addCustomAnnotation('Custom message', 'info', 3000);

// Configure thresholds
annotations.setThresholds({
  anomalySpike: 10,
  energyChange: 0.3
});
```

## Tutorial Content

### Built-in Tutorials

1. **Introduction to TDS** (Beginner, Text)
   - What is TDS?
   - Key concepts
   - Why study TDS?

2. **Understanding the Lattice** (Beginner, Interactive)
   - Lattice structure exploration
   - Node interactions

3. **Symmetry Breaking** (Intermediate, Animated)
   - Initial symmetric state
   - Introducing anomalies
   - Propagation patterns
   - New equilibrium

4. **Time Reversibility** (Intermediate, Text)
   - Reversible dynamics explanation
   - Information conservation
   - Practical applications

5. **Energy and Information Flow** (Advanced, Animated)
   - Energy concentration
   - Energy distribution
   - Flow visualization

### Adding Custom Tutorials

To add custom tutorials, extend the `loadTutorialLibrary()` method in MultimediaTutorial.ts:

```typescript
{
  id: 'custom-tutorial',
  title: 'Custom Tutorial Title',
  description: 'Brief description',
  type: 'text', // or 'video', 'interactive', 'animated'
  content: 'Tutorial content here',
  difficulty: 'beginner',
  prerequisites: ['intro-tds'], // optional
}
```

## Internationalization

All educational components support multiple languages:
- **English** (`src/i18n/en.json`)
- **Russian** (`src/i18n/ru.json`)
- **Ukrainian** (`src/i18n/uk.json`)

Quiz system includes full translations for:
- Quiz interface elements
- Button labels and navigation
- Feedback messages
- Difficulty and category labels
- Progress tracking text

## Styling

All educational components use consistent styling defined in:
- `styles/main.css` - Main styles including mode toggle and annotations
- `styles/tutorial.css` - Tutorial-specific styles
- `styles/guided-tour.css` - Guided tour styles
- `styles/quiz.css` - Quiz system styles

## Accessibility

All educational features include:
- Keyboard navigation support
- ARIA labels for screen readers
- High contrast theme support
- Responsive design for mobile devices
- Clear visual indicators

### 3. Quiz System (Quiz.ts)
Interactive quiz system for testing comprehension of TDS concepts:
- **Multiple Choice Questions**: Questions with 4 options each
- **Answer Validation**: Immediate feedback with explanations
- **Progress Tracking**: Tracks attempts, scores, and completion
- **Certificate Generation**: Printable certificates for passing quizzes
- **Multiple Difficulty Levels**: Beginner, intermediate, and advanced quizzes

#### Features:
- Question database covering all TDS concepts
- Real-time progress indicators
- Answer review after completion
- Score tracking and best score history
- Certificate generation for passing scores
- LocalStorage persistence for progress

#### Available Quizzes:
1. **Symmetry Basics** (Beginner, 70% passing)
   - Fundamental symmetry concepts
   - Node states and interactions
   - Symmetry metrics

2. **Anomaly Dynamics** (Intermediate, 75% passing)
   - Anomaly formation and propagation
   - Energy distribution effects
   - Visual effects and indicators

3. **Time Reversibility & Energy Conservation** (Advanced, 80% passing)
   - Reversible dynamics principles
   - Energy conservation laws
   - Information preservation

4. **Physics Problems** (Advanced, 75% passing)
   - Unsolved physics problems
   - TDS approaches to major challenges
   - Comparison with Standard Model

#### Usage:
```typescript
import { QuizSystem } from './education/Quiz.js';

const quizSystem = new QuizSystem();

// Start a specific quiz
quizSystem.startQuiz('symmetry-basics');

// Get available quizzes
const allQuizzes = quizSystem.getAvailableQuizzes();

// Get quizzes by difficulty
const beginnerQuizzes = quizSystem.getQuizzesByDifficulty('beginner');

// Check progress
const progress = quizSystem.getProgress('symmetry-basics');

// Get overall statistics
const stats = quizSystem.getOverallStatistics();
```

## Future Enhancements

Potential additions (marked as optional in tasks):
- Lesson planner for educators
- Presentation mode for teaching
- Collaborative learning features
- Adaptive difficulty based on performance
- Timed quiz mode
