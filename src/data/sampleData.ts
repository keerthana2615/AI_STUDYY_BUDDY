import type {
  QuizQuestion,
  QuizResult,
  StudentProfile,
  StudyDocument,
  StudyGoal,
  SyllabusTopic,
} from "../types/study";

export const DEFAULT_SUBJECTS = [
  "CS301 · Machine Learning",
  "CS304 · Deep Learning",
  "CS302 · Algorithms",
  "MA204 · Linear Algebra & Probability",
];

export const SAMPLE_DOCUMENTS: StudyDocument[] = [
  {
    id: "sample-doc-ml-unit2",
    title: "Unit 2: Supervised Learning & Gradient Descent",
    fileName: "CS301_Unit2_Supervised_Learning.pdf",
    subject: "CS301 · Machine Learning",
    uploadDate: "2026-11-10",
    pageCount: 4,
    status: "Processed",
    fileSizeLabel: "1.42 MB",
    origin: "sample",
    pages: [
      {
        pageNumber: 1,
        text: "Linear Regression models the relationship between input features x and continuous target y as y_hat = w^T x + b. The Mean Squared Error (MSE) objective function is J(w, b) = (1 / 2m) * sum_{i=1}^m (y_hat^(i) - y^(i))^2. Minimizing MSE yields the maximum likelihood estimate under Gaussian noise assumptions.",
      },
      {
        pageNumber: 2,
        text: "Gradient Descent iteratively updates parameters in the opposite direction of the gradient: w := w - alpha * dJ/dw, where alpha is the learning rate. Batch Gradient Descent computes gradients over the entire dataset per step (stable convergence, slow on large N). Stochastic Gradient Descent (SGD) updates per single sample (noisy trajectory, escapes shallow local minima). Mini-batch Gradient Descent balances variance and vectorized hardware throughput using batch sizes like 32 or 64.",
      },
      {
        pageNumber: 3,
        text: "Bias-Variance Tradeoff: Total expected generalization error decomposes into Bias^2 + Variance + Irreducible Noise. High bias indicates underfitting (model too simple to capture underlying structure, high training and validation error). High variance indicates overfitting (model memorizes training noise, low training error but high validation error). Regularization adds a penalty term: L2 (Ridge) penalizes lambda * ||w||_2^2 shrinking weights smoothly; L1 (Lasso) penalizes lambda * ||w||_1 encouraging sparse feature selection.",
      },
      {
        pageNumber: 4,
        text: "Logistic Regression maps linear logits z = w^T x + b into probabilities via the sigmoid function sigma(z) = 1 / (1 + e^-z). Because MSE with sigmoid is non-convex, we minimize Binary Cross-Entropy (Log Loss): L = -[y log(y_hat) + (1 - y) log(1 - y_hat)]. Cross-entropy creates a convex loss surface with respect to w and b.",
      },
    ],
  },
  {
    id: "sample-doc-dl-backprop",
    title: "Backpropagation, CNNs & Attention Mechanisms",
    fileName: "CS304_Deep_Learning_Notes.pdf",
    subject: "CS304 · Deep Learning",
    uploadDate: "2026-11-12",
    pageCount: 4,
    status: "Processed",
    fileSizeLabel: "2.18 MB",
    origin: "sample",
    pages: [
      {
        pageNumber: 1,
        text: "Backpropagation applies the chain rule of calculus recursively from output loss L backward to every weight matrix W^(l). Vanishing gradients occur when sigmoid or tanh derivatives (< 1) multiply across many layers, stalling early layer updates. ReLU(x) = max(0, x) mitigates vanishing gradients for positive activations, while Residual Connections (ResNet) add identity skip paths y = F(x) + x so gradients flow unimpeded.",
      },
      {
        pageNumber: 2,
        text: "Convolutional Neural Networks (CNNs) exploit spatial locality and weight sharing via learnable kernels. For an input of width W, kernel K, padding P, and stride S, output dimension is floor((W - K + 2P) / S) + 1. Batch Normalization stabilizes internal covariate shift by normalizing mini-batch activations to zero mean and unit variance with learnable scale gamma and shift beta.",
      },
      {
        pageNumber: 3,
        text: "Self-Attention computes pairwise token interactions without recurrence. Given Queries Q, Keys K, and Values V, Scaled Dot-Product Attention is Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V. Dividing by sqrt(d_k) prevents large dot products from pushing softmax into regions with tiny gradients. Multi-Head Attention runs h parallel attention projections to capture diverse syntactic and semantic subspaces.",
      },
      {
        pageNumber: 4,
        text: "Optimization in Deep Learning: Momentum accumulates an exponentially decaying moving average of past gradients to dampen oscillations in steep ravines. Adam (Adaptive Moment Estimation) combines first-moment (momentum m_t) and second-moment (RMSProp v_t) estimates with bias correction, making it robust across sparse gradients and non-stationary objectives.",
      },
    ],
  },
  {
    id: "sample-doc-algo-dp",
    title: "Dynamic Programming & Shortest Path Graphs",
    fileName: "CS302_DP_and_Graphs.pdf",
    subject: "CS302 · Algorithms",
    uploadDate: "2026-11-08",
    pageCount: 3,
    status: "Processed",
    fileSizeLabel: "980 KB",
    origin: "sample",
    pages: [
      {
        pageNumber: 1,
        text: "Dynamic Programming (DP) applies when a problem exhibits two properties: Optimal Substructure (optimal solution builds from optimal subproblem solutions) and Overlapping Subproblems (same subproblems recur exponentially in naive recursion). Top-down memoization caches recursive calls; bottom-up tabulation fills a DP table iteratively in topological order.",
      },
      {
        pageNumber: 2,
        text: "0/1 Knapsack cannot be solved greedily by value-to-weight ratio because items are indivisible. State dp[i][w] represents maximum value using first i items within capacity w, taking O(nW) pseudo-polynomial time. Longest Common Subsequence (LCS) runs in O(mn) time using recurrence dp[i][j] = 1 + dp[i-1][j-1] if A[i] == B[j], else max(dp[i-1][j], dp[i][j-1]).",
      },
      {
        pageNumber: 3,
        text: "Dijkstra's algorithm finds single-source shortest paths in graphs with non-negative edge weights in O((V + E) log V) time using a binary min-heap. Bellman-Ford handles negative edge weights in O(VE) time and detects negative-weight cycles by checking if any edge relaxes on the V-th pass.",
      },
    ],
  },
  {
    id: "sample-doc-math-linalg",
    title: "Eigenvalues, SVD & Bayesian Inference",
    fileName: "MA204_Linear_Algebra_Bayes.pdf",
    subject: "MA204 · Linear Algebra & Probability",
    uploadDate: "2026-11-14",
    pageCount: 3,
    status: "Processed",
    fileSizeLabel: "1.15 MB",
    origin: "sample",
    pages: [
      {
        pageNumber: 1,
        text: "For a square matrix A, a non-zero vector v is an eigenvector with eigenvalue lambda if A v = lambda v, solved via characteristic equation det(A - lambda I) = 0. Symmetric positive semi-definite matrices (such as covariance matrices Sigma = (1/n) X^T X) always have real, non-negative eigenvalues and orthogonal eigenvectors.",
      },
      {
        pageNumber: 2,
        text: "Principal Component Analysis (PCA) projects centered data onto top-k eigenvectors of the covariance matrix corresponding to the largest eigenvalues, maximizing retained variance. Singular Value Decomposition (SVD) factors any m x n matrix A = U Sigma V^T, enabling low-rank approximations and pseudoinverses without requiring A to be square.",
      },
      {
        pageNumber: 3,
        text: "Bayes' Theorem updates prior belief P(H) with likelihood P(D | H) to compute posterior P(H | D) = [P(D | H) * P(H)] / P(D), where P(D) is marginal evidence. Maximum A Posteriori (MAP) estimation incorporates a prior over parameters; under a Gaussian prior, MAP linear regression is mathematically equivalent to L2 Ridge regularization.",
      },
    ],
  },
];

export const SAMPLE_TOPICS: SyllabusTopic[] = [
  {
    id: "topic-gd",
    name: "Gradient Descent & Optimizers",
    subject: "CS301 · Machine Learning",
    unit: "Unit 2",
    examWeight: 0.9,
    sampleMastery: 84,
    origin: "sample",
  },
  {
    id: "topic-bias-var",
    name: "Bias-Variance & Regularization",
    subject: "CS301 · Machine Learning",
    unit: "Unit 2",
    examWeight: 0.95,
    sampleMastery: 72,
    origin: "sample",
  },
  {
    id: "topic-backprop",
    name: "Backpropagation & Vanishing Gradients",
    subject: "CS304 · Deep Learning",
    unit: "Unit 1",
    examWeight: 0.85,
    sampleMastery: 64,
    origin: "sample",
  },
  {
    id: "topic-attention",
    name: "Self-Attention & Transformers",
    subject: "CS304 · Deep Learning",
    unit: "Unit 3",
    examWeight: 1.0,
    sampleMastery: 42,
    origin: "sample",
  },
  {
    id: "topic-dp",
    name: "Dynamic Programming & Knapsack",
    subject: "CS302 · Algorithms",
    unit: "Unit 3",
    examWeight: 0.9,
    sampleMastery: 55,
    origin: "sample",
  },
  {
    id: "topic-graphs",
    name: "Dijkstra & Bellman-Ford Paths",
    subject: "CS302 · Algorithms",
    unit: "Unit 4",
    examWeight: 0.75,
    sampleMastery: 78,
    origin: "sample",
  },
  {
    id: "topic-svd",
    name: "Eigenvalues, PCA & SVD",
    subject: "MA204 · Linear Algebra & Probability",
    unit: "Unit 2",
    examWeight: 0.8,
    sampleMastery: 68,
    origin: "sample",
  },
  {
    id: "topic-bayes",
    name: "Bayes' Theorem & MAP Estimation",
    subject: "MA204 · Linear Algebra & Probability",
    unit: "Unit 4",
    examWeight: 0.85,
    sampleMastery: 48,
    origin: "sample",
  },
];

export const SAMPLE_QUIZ_RESULTS: QuizResult[] = [
  {
    id: "sample-res-1",
    subject: "CS301 · Machine Learning",
    topic: "Gradient Descent & Optimizers",
    score: 5,
    total: 5,
    percentage: 100,
    completedAt: "2026-11-11",
    origin: "sample",
    mode: "demo-simulated",
  },
  {
    id: "sample-res-2",
    subject: "CS301 · Machine Learning",
    topic: "Bias-Variance & Regularization",
    score: 4,
    total: 5,
    percentage: 80,
    completedAt: "2026-11-12",
    origin: "sample",
    mode: "demo-simulated",
  },
  {
    id: "sample-res-3",
    subject: "CS304 · Deep Learning",
    topic: "Self-Attention & Transformers",
    score: 2,
    total: 5,
    percentage: 40,
    completedAt: "2026-11-14",
    origin: "sample",
    mode: "demo-simulated",
  },
  {
    id: "sample-res-4",
    subject: "MA204 · Linear Algebra & Probability",
    topic: "Bayes' Theorem & MAP Estimation",
    score: 2,
    total: 4,
    percentage: 50,
    completedAt: "2026-11-15",
    origin: "sample",
    mode: "demo-simulated",
  },
  {
    id: "sample-res-5",
    subject: "CS302 · Algorithms",
    topic: "Dijkstra & Bellman-Ford Paths",
    score: 4,
    total: 5,
    percentage: 80,
    completedAt: "2026-11-16",
    origin: "sample",
    mode: "demo-simulated",
  },
];

export const SAMPLE_STUDY_GOALS: StudyGoal[] = [
  {
    id: "goal-1",
    title: "Review Scaled Dot-Product Attention derivation (CS304 p. 3)",
    subject: "CS304 · Deep Learning",
    estimatedMinutes: 35,
    completed: false,
    origin: "sample",
  },
  {
    id: "goal-2",
    title: "Complete 5 MCQs on Bayes' Theorem & MAP Estimation",
    subject: "MA204 · Linear Algebra & Probability",
    estimatedMinutes: 20,
    completed: false,
    origin: "sample",
  },
  {
    id: "goal-3",
    title: "Trace 0/1 Knapsack DP table recurrence on paper",
    subject: "CS302 · Algorithms",
    estimatedMinutes: 30,
    completed: true,
    origin: "sample",
  },
  {
    id: "goal-4",
    title: "Compare L1 vs L2 regularization notes for Unit 2",
    subject: "CS301 · Machine Learning",
    estimatedMinutes: 25,
    completed: true,
    origin: "sample",
  },
];

export const DEFAULT_PROFILE: StudentProfile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@btech-aiml.edu",
  program: "B.Tech CSE (AI & ML)",
  semester: "Semester 5",
  preferredSubjects: [
    "CS301 · Machine Learning",
    "CS304 · Deep Learning",
    "CS302 · Algorithms",
    "MA204 · Linear Algebra & Probability",
  ],
  dailyReminderTime: "19:00",
  groundedStrictMode: true,
  localOnlyStorage: true,
};

export function simulateGroundedAnswer(
  question: string,
  documents: StudyDocument[],
  subjectFilter: string
) {
  const pool =
    subjectFilter && subjectFilter !== "all"
      ? documents.filter((d) => d.subject === subjectFilter)
      : documents;

  const qLower = question.toLowerCase();
  const tokens = qLower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  let bestDoc: StudyDocument | null = null;
  let bestPage = 1;
  let bestScore = 0;
  let bestText = "";

  for (const doc of pool) {
    for (const p of doc.pages) {
      const pLower = p.text.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (pLower.includes(tok)) score += 2;
        if (doc.title.toLowerCase().includes(tok)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
        bestPage = p.pageNumber;
        bestText = p.text;
      }
    }
  }

  // Handle generic prompt suggestions like "Summarize this chapter."
  if (
    !bestDoc &&
    pool.length > 0 &&
    (qLower.includes("summarize") ||
      qLower.includes("explain this") ||
      qLower.includes("important points") ||
      qLower.includes("example"))
  ) {
    bestDoc = pool[0];
    bestPage = 1;
    bestText = pool[0].pages[0]?.text || "";
    bestScore = 2;
  }

  if (!bestDoc || bestScore < 2) {
    return {
      insufficientEvidence: true,
      answer:
        "Insufficient evidence in your material. Please upload relevant notes or choose another question.",
      keyPoints: [],
      simpleExplanation:
        "No matching passages were found in the currently selected course documents.",
      citations: [],
      mode: "demo-simulated" as const,
    };
  }

  const sentences = bestText
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 15);

  return {
    insufficientEvidence: false,
    answer: `Based on "${bestDoc.title}" (Page ${bestPage}): ${sentences.slice(0, 3).join(" ")}`,
    keyPoints:
      sentences.length >= 2
        ? sentences.slice(0, 3)
        : [bestText.slice(0, 180)],
    simpleExplanation: `In simple terms, this section from ${bestDoc.subject} explains the core mechanism step by step so you can connect the mathematical definition directly to exam problem-solving.`,
    citations: [
      {
        docId: bestDoc.id,
        docTitle: bestDoc.title,
        pageNumber: bestPage,
        excerpt: bestText.slice(0, 220) + (bestText.length > 220 ? "..." : ""),
      },
    ],
    mode: "demo-simulated" as const,
  };
}

export function simulateQuizFromDocs(
  subject: string,
  topic: string,
  numQuestions: number,
  documents: StudyDocument[]
): QuizQuestion[] {
  const bank: QuizQuestion[] = [
    {
      id: "sim-q-1",
      subject: "CS304 · Deep Learning",
      topic: "Self-Attention & Transformers",
      question:
        "Why does Scaled Dot-Product Attention divide QK^T by sqrt(d_k) before applying softmax?",
      options: [
        "To prevent large dot products from pushing softmax into regions with tiny gradients",
        "To convert non-square value matrices into orthogonal vectors",
        "To eliminate the need for positional encodings in sequence tasks",
        "To guarantee O(n) linear time complexity with respect to sequence length",
      ],
      correctIndex: 0,
      explanation:
        "For large key dimensions d_k, dot products grow large in magnitude, saturating softmax where gradients become vanishingly small.",
      sourceDocId: "sample-doc-dl-backprop",
      sourceDocTitle: "Backpropagation, CNNs & Attention Mechanisms",
      sourcePage: 3,
      sourcePassage:
        "Dividing by sqrt(d_k) prevents large dot products from pushing softmax into regions with tiny gradients.",
    },
    {
      id: "sim-q-2",
      subject: "CS301 · Machine Learning",
      topic: "Bias-Variance & Regularization",
      question:
        "Which regularization penalty encourages sparse feature weights by driving irrelevant coefficients to exact zero?",
      options: [
        "L2 (Ridge) regularization",
        "L1 (Lasso) regularization",
        "Batch Normalization",
        "Early Stopping without penalty",
      ],
      correctIndex: 1,
      explanation:
        "L1 (Lasso) penalizes the sum of absolute weights lambda * ||w||_1, producing corner solutions that zero out weak features.",
      sourceDocId: "sample-doc-ml-unit2",
      sourceDocTitle: "Unit 2: Supervised Learning & Gradient Descent",
      sourcePage: 3,
      sourcePassage:
        "L2 (Ridge) penalizes lambda * ||w||_2^2 shrinking weights smoothly; L1 (Lasso) penalizes lambda * ||w||_1 encouraging sparse feature selection.",
    },
    {
      id: "sim-q-3",
      subject: "CS301 · Machine Learning",
      topic: "Gradient Descent & Optimizers",
      question:
        "Why is Binary Cross-Entropy preferred over Mean Squared Error for Logistic Regression?",
      options: [
        "MSE requires matrix inversion on every epoch",
        "Binary Cross-Entropy yields a convex loss surface with sigmoid outputs, whereas MSE is non-convex",
        "Cross-Entropy removes the learning rate hyperparameter",
        "MSE only works for multi-class problems with more than 10 classes",
      ],
      correctIndex: 1,
      explanation:
        "Pairing sigmoid activation with MSE creates non-convex local minima, while Binary Cross-Entropy produces a convex optimization objective.",
      sourceDocId: "sample-doc-ml-unit2",
      sourceDocTitle: "Unit 2: Supervised Learning & Gradient Descent",
      sourcePage: 4,
      sourcePassage:
        "Because MSE with sigmoid is non-convex, we minimize Binary Cross-Entropy (Log Loss)... Cross-entropy creates a convex loss surface with respect to w and b.",
    },
    {
      id: "sim-q-4",
      subject: "CS302 · Algorithms",
      topic: "Dijkstra & Bellman-Ford Paths",
      question:
        "How does Bellman-Ford detect the presence of a negative-weight cycle reachable from the source?",
      options: [
        "By checking whether any edge can still be relaxed on the V-th pass",
        "By running a binary min-heap until the heap becomes empty",
        "By sorting edges in descending order of weight before relaxation",
        "By verifying that all diagonal entries of the adjacency matrix are zero",
      ],
      correctIndex: 0,
      explanation:
        "Shortest paths without negative cycles contain at most V - 1 edges; any further relaxation on the V-th pass proves a negative-weight cycle exists.",
      sourceDocId: "sample-doc-algo-dp",
      sourceDocTitle: "Dynamic Programming & Shortest Path Graphs",
      sourcePage: 3,
      sourcePassage:
        "Bellman-Ford handles negative edge weights in O(VE) time and detects negative-weight cycles by checking if any edge relaxes on the V-th pass.",
    },
    {
      id: "sim-q-5",
      subject: "MA204 · Linear Algebra & Probability",
      topic: "Bayes' Theorem & MAP Estimation",
      question:
        "Under a zero-mean Gaussian prior on model weights, MAP estimation in linear regression is equivalent to which technique?",
      options: [
        "L2 (Ridge) regularization",
        "Principal Component Analysis",
        "K-Means Clustering",
        "Min-Max Feature Scaling",
      ],
      correctIndex: 0,
      explanation:
        "Taking the negative log of a Gaussian prior introduces a quadratic ||w||_2^2 penalty, matching Ridge regression.",
      sourceDocId: "sample-doc-math-linalg",
      sourceDocTitle: "Eigenvalues, SVD & Bayesian Inference",
      sourcePage: 3,
      sourcePassage:
        "Maximum A Posteriori (MAP) estimation incorporates a prior over parameters; under a Gaussian prior, MAP linear regression is mathematically equivalent to L2 Ridge regularization.",
    },
    {
      id: "sim-q-6",
      subject: "CS304 · Deep Learning",
      topic: "Backpropagation & Vanishing Gradients",
      question:
        "How do Residual Connections (ResNet) help alleviate vanishing gradients in deep networks?",
      options: [
        "They replace all non-linear activations with linear projections",
        "They add identity skip paths y = F(x) + x allowing gradients to flow directly backward",
        "They freeze early layer weights after the first training epoch",
        "They increase the stride of every convolutional filter to 4",
      ],
      correctIndex: 1,
      explanation:
        "Identity skip connections create an additive gradient path with derivative 1, preventing repeated multiplication by small derivatives.",
      sourceDocId: "sample-doc-dl-backprop",
      sourceDocTitle: "Backpropagation, CNNs & Attention Mechanisms",
      sourcePage: 1,
      sourcePassage:
        "Residual Connections (ResNet) add identity skip paths y = F(x) + x so gradients flow unimpeded.",
    },
  ];

  // Ensure cited documents exist in current workspace if user uploaded custom docs
  const matching = bank.filter(
    (q) =>
      (subject === "all" || q.subject === subject) &&
      (topic === "all" || q.topic === topic)
  );
  const pool = matching.length > 0 ? matching : bank;
  const fallbackDoc = documents[0];

  const result: QuizQuestion[] = [];
  for (let i = 0; i < numQuestions; i++) {
    const template = pool[i % pool.length];
    const hasDoc = documents.some((d) => d.id === template.sourceDocId);
    result.push({
      ...template,
      id: `sim-quiz-${Date.now()}-${i}`,
      topic: topic !== "all" ? topic : template.topic,
      sourceDocId: hasDoc
        ? template.sourceDocId
        : fallbackDoc?.id || template.sourceDocId,
      sourceDocTitle: hasDoc
        ? template.sourceDocTitle
        : fallbackDoc?.title || template.sourceDocTitle,
      sourcePage: hasDoc ? template.sourcePage : 1,
    });
  }
  return result;
}
