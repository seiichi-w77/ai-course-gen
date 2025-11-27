/**
 * Course Generation Request
 * Contains parameters for AI-powered course generation
 */
export interface CourseGenerationRequest {
  /** Topic or subject for the course */
  topic: string;
  /** Target difficulty level */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Approximate number of modules to generate */
  numModules: number;
  /** Optional focus areas or specific topics within the subject */
  focusAreas?: string[];
  /** Optional learning objectives */
  objectives?: string[];
}

/**
 * Individual lesson within a module
 */
export interface Lesson {
  /** Unique lesson identifier */
  id: string;
  /** Lesson title */
  title: string;
  /** Lesson duration in minutes */
  duration: number;
  /** Learning objectives for the lesson */
  objectives: string[];
  /** Main lesson content */
  content: string;
  /** Optional resources (links, documents, etc.) */
  resources?: string[];
  /** Practice exercises */
  exercises?: Exercise[];
}

/**
 * Exercise within a lesson
 */
export interface Exercise {
  /** Exercise identifier */
  id: string;
  /** Exercise description */
  description: string;
  /** Exercise difficulty */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Solution or hint */
  solution?: string;
}

/**
 * Module containing multiple lessons
 */
export interface Module {
  /** Unique module identifier */
  id: string;
  /** Module title */
  title: string;
  /** Module description */
  description: string;
  /** Key concepts covered in this module */
  keyConcepts: string[];
  /** Array of lessons in this module */
  lessons: Lesson[];
  /** Overall module duration in minutes */
  totalDuration: number;
}

/**
 * Fully generated course
 */
export interface GeneratedCourse {
  /** Unique course identifier */
  id: string;
  /** Course title */
  title: string;
  /** Detailed course description */
  description: string;
  /** Subject or topic */
  topic: string;
  /** Difficulty level */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Course learning objectives */
  objectives: string[];
  /** Array of modules in this course */
  modules: Module[];
  /** Total course duration in minutes */
  totalDuration: number;
  /** Prerequisites for taking this course */
  prerequisites?: string[];
  /** Estimated time to complete course (in hours) */
  estimatedHours?: number;
}
