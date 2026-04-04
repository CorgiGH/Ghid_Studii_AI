export default {
  courseId: 'course_1',
  questions: [
    {
      id: 'c1-q1',
      type: 'multiple-choice',
      question: 'What command lists files in a directory?',
      options: ['cd', 'ls', 'pwd', 'cat'],
      correct: 1,
      explanation: 'ls lists directory contents. cd changes directory, pwd prints working directory, cat displays file contents.',
      keyConcepts: ['ls', 'directory listing', 'basic commands'],
    },
    {
      id: 'c1-q2',
      type: 'multiple-choice',
      question: 'Which permission allows executing a file?',
      options: ['r (read)', 'w (write)', 'x (execute)', 'd (directory)'],
      correct: 2,
      explanation: 'The x (execute) permission allows running a file as a program or script.',
      keyConcepts: ['permissions', 'execute', 'chmod'],
    },
    {
      id: 'c1-q3',
      type: 'open-ended',
      question: 'Explain the difference between absolute and relative paths in Linux.',
      keyConcepts: ['absolute path', 'relative path', 'root directory', 'current directory', '/'],
      modelAnswer: 'An absolute path starts from the root directory (/) and specifies the complete location of a file, e.g., /home/user/file.txt. A relative path starts from the current working directory and uses . (current dir) and .. (parent dir) to navigate, e.g., ../docs/file.txt.',
    },
  ],
};
