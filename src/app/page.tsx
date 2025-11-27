'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface CourseFormData {
  topic: string;
  level: string;
  duration: string;
  language: string;
}

interface GeneratedCourse {
  title: string;
  description: string;
  modules: Array<{
    title: string;
    lessons: string[];
  }>;
  estimatedHours: number;
}

const LEVEL_OPTIONS: SelectOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const DURATION_OPTIONS: SelectOption[] = [
  { value: '1-week', label: '1 Week' },
  { value: '2-weeks', label: '2 Weeks' },
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
  { value: 'self-paced', label: 'Self-Paced' },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'english', label: 'English' },
  { value: 'japanese', label: '日本語' },
  { value: 'spanish', label: 'Español' },
  { value: 'french', label: 'Français' },
  { value: 'chinese', label: '中文' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Home() {
  const [formData, setFormData] = useState<CourseFormData>({
    topic: '',
    level: '',
    duration: '',
    language: 'english',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.topic.trim()) {
      setError('Please enter a course topic');
      return;
    }
    if (!formData.level) {
      setError('Please select a difficulty level');
      return;
    }
    if (!formData.duration) {
      setError('Please select a course duration');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate course');
      }

      const data = await response.json();
      setGeneratedCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratedCourse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-3xl opacity-10 dark:opacity-5" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-secondary)] rounded-full blur-3xl opacity-10 dark:opacity-5" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Learn AI,
            <br />
            <span className="text-[var(--color-primary)]">Your Way</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-[var(--color-gray-600)] dark:text-[var(--color-gray-400)] mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Generate personalized AI learning courses tailored to your goals, experience level, and
            schedule. Powered by Claude AI, creating the perfect learning path for you.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => document.getElementById('course-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Learning
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8"
      >
        {/* Course Generation Form */}
        <motion.div variants={itemVariants} id="course-form">
          <Card variant="elevated" className="mb-12">
            <CardHeader>
              <CardTitle>Create Your Course</CardTitle>
              <CardDescription>
                Fill in your preferences to generate a customized learning course
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Input */}
                <motion.div variants={itemVariants}>
                  <Input
                    label="Course Topic"
                    name="topic"
                    placeholder="e.g., Machine Learning, Natural Language Processing, Computer Vision"
                    value={formData.topic}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Level and Duration Row */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Difficulty Level"
                    name="level"
                    options={LEVEL_OPTIONS}
                    placeholder="Select your level"
                    value={formData.level}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />

                  <Select
                    label="Course Duration"
                    name="duration"
                    options={DURATION_OPTIONS}
                    placeholder="Select duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Language Selection */}
                <motion.div variants={itemVariants}>
                  <Select
                    label="Language"
                    name="language"
                    options={LANGUAGE_OPTIONS}
                    value={formData.language}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--color-error)] bg-opacity-10 border border-[var(--color-error)] rounded-[var(--radius-lg)] text-[var(--color-error)]"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Generating...' : 'Generate Course'}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Course Display */}
        {generatedCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            variants={itemVariants}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">{generatedCourse.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {generatedCourse.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Course Metadata */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[var(--color-primary)]">
                        {generatedCourse.estimatedHours}h
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-gray-500)]">Estimated Time</p>
                      <p className="font-medium">{generatedCourse.estimatedHours} hours</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-success)] bg-opacity-10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[var(--color-success)]">
                        {generatedCourse.modules.length}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-gray-500)]">Modules</p>
                      <p className="font-medium">{generatedCourse.modules.length} modules</p>
                    </div>
                  </div>
                </div>

                {/* Modules */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Course Structure</h3>
                  {generatedCourse.modules.map((module, moduleIndex) => (
                    <motion.div
                      key={moduleIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: moduleIndex * 0.1 }}
                      className="border-l-4 border-[var(--color-primary)] pl-6 py-2"
                    >
                      <h4 className="font-semibold text-lg mb-3">
                        Module {moduleIndex + 1}: {module.title}
                      </h4>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li
                            key={lessonIndex}
                            className="flex items-start gap-3 text-[var(--color-gray-600)] dark:text-[var(--color-gray-400)]"
                          >
                            <span className="text-[var(--color-primary)] font-semibold mt-0.5">
                              ✓
                            </span>
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border)]">
                  <Button size="md" variant="primary" className="flex-1">
                    Start Learning
                  </Button>
                  <Button size="md" variant="outline" className="flex-1">
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!generatedCourse && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12 text-[var(--color-gray-500)]"
          >
            <p>Fill in the form above to generate your personalized course</p>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
