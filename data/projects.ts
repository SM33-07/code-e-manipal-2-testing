export interface Project {
  id: string;
  title: string;
  teamName: string;
  shortIdea: string;
  fullIdea: string;
  technicalDetails: string;
  reflection: string;
  demoVideoUrl: string;
  videoThumbnail: string;
  technologies: string[];
  category: string;
  teamMembers: string[];
  placement?: '1st' | '2nd' | '3rd' | 'special';
  specialAward?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'EcoTrack - Carbon Footprint Analyzer',
    teamName: 'Green Coders',
    shortIdea: 'AI-powered platform to track and reduce personal carbon footprint through daily activity monitoring.',
    fullIdea: 'EcoTrack is a comprehensive carbon footprint tracking application that uses machine learning to analyze users\' daily activities, transportation methods, food consumption, and energy usage. The platform provides personalized recommendations to reduce environmental impact and gamifies sustainability through challenges and achievements. Users can compete with friends, join community initiatives, and receive real-time insights about their environmental impact.',
    technicalDetails: 'Built using React with TypeScript for the frontend, Node.js and Express for the backend API, and TensorFlow.js for ML-based predictions. MongoDB stores user data and activity logs. We implemented OAuth 2.0 for secure authentication, integrated Google Maps API for transportation tracking, and used Chart.js for data visualization. The carbon calculation algorithm was developed using IPCC emission factors and validated against existing environmental databases.',
    reflection: 'This project taught us the importance of accurate data modeling when dealing with environmental metrics. We initially struggled with real-time data synchronization but solved it using WebSocket connections. The biggest learning was balancing feature complexity with user experience - we simplified our UI after initial user testing showed confusion. We also learned about sustainable software practices, optimizing our code to reduce server load and energy consumption.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'TensorFlow.js', 'WebSocket'],
    category: 'Sustainability',
    teamMembers: ['Priya Sharma', 'Rahul Verma', 'Ananya Desai', 'Karthik Menon'],
    placement: '1st',
    featured: true
  },
  {
    id: '2',
    title: 'MediConnect - Healthcare Bridge',
    teamName: 'HealthTech Innovators',
    shortIdea: 'Blockchain-based platform connecting patients with doctors for secure telemedicine consultations.',
    fullIdea: 'MediConnect revolutionizes healthcare accessibility by creating a secure, decentralized platform for telemedicine. Using blockchain technology, we ensure patient data privacy while enabling seamless doctor-patient interactions. The platform features video consultations, prescription management, medical record storage, appointment scheduling, and an AI chatbot for preliminary symptom analysis. We also integrated a pharmacy network for medicine delivery.',
    technicalDetails: 'Frontend built with React and Redux for state management. Backend uses Node.js with Express and integrates with Ethereum blockchain via Web3.js for storing medical records as encrypted hashes. Video consultations powered by WebRTC with TURN/STUN servers. Smart contracts written in Solidity manage access control and audit trails. PostgreSQL database for non-critical data. Implemented AES-256 encryption for sensitive data and HIPAA-compliant security measures.',
    reflection: 'Working with blockchain was challenging but rewarding. We learned about gas optimization in smart contracts and the trade-offs between decentralization and performance. The video quality optimization was crucial - we implemented adaptive bitrate streaming to handle varying network conditions. User privacy was paramount, leading us to deep dive into cryptography and secure key management. The biggest takeaway was understanding healthcare regulations and designing systems that comply with medical data standards.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format',
    technologies: ['React', 'Redux', 'Blockchain', 'Solidity', 'WebRTC', 'PostgreSQL', 'Web3.js'],
    category: 'Healthcare',
    teamMembers: ['Sneha Patel', 'Arjun Kumar', 'Divya Reddy'],
    placement: '2nd',
    featured: true
  },
  {
    id: '3',
    title: 'LearnFlow - Adaptive Learning Platform',
    teamName: 'EduTech Pioneers',
    shortIdea: 'Machine learning platform that adapts educational content to individual student learning patterns.',
    fullIdea: 'LearnFlow uses advanced ML algorithms to analyze student performance, learning speed, and comprehension patterns to create personalized learning paths. The platform dynamically adjusts difficulty levels, recommends resources, and identifies knowledge gaps. Features include interactive quizzes, progress tracking, peer collaboration tools, and teacher dashboards for monitoring class performance. The system supports multiple subjects and integrates with existing LMS platforms.',
    technicalDetails: 'Built using Next.js for server-side rendering and SEO optimization. Python backend with Flask for ML model serving. PostgreSQL database with Redis caching layer. The recommendation engine uses collaborative filtering and neural networks trained on student interaction data. Implemented natural language processing for automated quiz generation using OpenAI GPT-4 API. Real-time analytics dashboard built with D3.js. Docker containerization for easy deployment.',
    reflection: 'This project deepened our understanding of educational psychology and how technology can enhance learning. We faced challenges in model accuracy initially, which we improved through extensive data preprocessing and feature engineering. Balancing automation with teacher control was crucial - we added manual override options after educator feedback. We learned about data privacy in educational contexts and implemented FERPA-compliant data handling. The most rewarding aspect was seeing how personalization could genuinely improve learning outcomes.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format',
    technologies: ['Next.js', 'Python', 'Flask', 'PostgreSQL', 'Redis', 'TensorFlow', 'D3.js'],
    category: 'Education',
    teamMembers: ['Aditya Singh', 'Meera Iyer', 'Rohan Kapoor', 'Sanya Gupta'],
    placement: '3rd',
    featured: true
  },
  {
    id: '4',
    title: 'SmartCity Dashboard',
    teamName: 'Urban Innovators',
    shortIdea: 'Real-time IoT dashboard for monitoring and managing city infrastructure and services.',
    fullIdea: 'A comprehensive dashboard that aggregates data from various city sensors and systems to provide real-time insights into traffic, air quality, waste management, street lighting, and emergency services. City administrators can monitor key metrics, receive alerts for anomalies, and make data-driven decisions to improve urban living.',
    technicalDetails: 'React frontend with Mapbox for interactive city maps. Backend built with Node.js and GraphQL API. InfluxDB time-series database for sensor data. MQTT protocol for IoT device communication. Implemented predictive analytics using Python and scikit-learn for traffic forecasting. Microservices architecture deployed on Kubernetes.',
    reflection: 'We learned about the complexity of IoT systems and the importance of robust error handling when dealing with unreliable sensor networks. Data visualization was key - we iterated multiple times to find the right balance of information density. Working with real-time data streams taught us about efficient data processing and the importance of proper indexing.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format',
    technologies: ['React', 'GraphQL', 'Node.js', 'InfluxDB', 'MQTT', 'Python', 'Kubernetes'],
    category: 'Smart City',
    teamMembers: ['Vikram Malhotra', 'Pooja Nair', 'Sameer Khan'],
    placement: 'special',
    specialAward: 'Best IoT Implementation',
    featured: false
  },
  {
    id: '5',
    title: 'FarmAI - Agricultural Intelligence',
    teamName: 'AgriTech Solutions',
    shortIdea: 'AI-powered crop monitoring and yield prediction system using satellite imagery and weather data.',
    fullIdea: 'FarmAI helps farmers optimize crop yields through predictive analytics, disease detection, and precision agriculture recommendations. The platform analyzes satellite imagery, soil data, weather patterns, and historical yields to provide actionable insights. Features include crop health monitoring, pest detection, irrigation scheduling, and market price forecasting.',
    technicalDetails: 'Python-based backend using FastAPI. Computer vision models built with PyTorch for crop disease detection. Integration with NASA and NOAA APIs for satellite and weather data. PostgreSQL with PostGIS extension for geospatial data. React Native mobile app for field use. Implemented offline-first architecture for areas with poor connectivity.',
    reflection: 'This project taught us about domain-specific challenges in agriculture. We spent significant time understanding farming practices and constraints. The offline-first approach was technically challenging but essential for real-world usability. We learned to optimize ML models for mobile deployment and handle large satellite image processing efficiently.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format',
    technologies: ['Python', 'FastAPI', 'PyTorch', 'React Native', 'PostgreSQL', 'PostGIS'],
    category: 'Agriculture',
    teamMembers: ['Deepak Rao', 'Lakshmi Krishnan', 'Naveen Kumar'],
    featured: false
  },
  {
    id: '6',
    title: 'FinSecure - Fraud Detection System',
    teamName: 'CyberGuard',
    shortIdea: 'Real-time transaction monitoring system using ML to detect and prevent financial fraud.',
    fullIdea: 'FinSecure is an advanced fraud detection platform that analyzes transaction patterns in real-time to identify suspicious activities. Using ensemble ML models, the system flags potentially fraudulent transactions while minimizing false positives. Features include behavioral analytics, risk scoring, automated blocking, and compliance reporting.',
    technicalDetails: 'Scala backend with Apache Kafka for stream processing. ML models using XGBoost and Random Forests. Elasticsearch for fast transaction lookups. React dashboard with real-time updates via WebSocket. Implemented feature engineering pipeline and model retraining automation. Achieved 99.2% accuracy with only 0.3% false positive rate.',
    reflection: 'Working with financial data taught us about the critical importance of accuracy and the cost of false positives. We learned advanced feature engineering techniques and how to handle severely imbalanced datasets. The real-time processing requirements pushed us to optimize our code extensively. Understanding regulatory requirements for financial systems was eye-opening.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format',
    technologies: ['Scala', 'Kafka', 'XGBoost', 'Elasticsearch', 'React', 'WebSocket'],
    category: 'Fintech',
    teamMembers: ['Harsh Agarwal', 'Riya Chatterjee', 'Manish Joshi', 'Kavya Pillai'],
    placement: 'special',
    specialAward: 'Best Security Solution',
    featured: false
  },
  {
    id: '7',
    title: 'VoiceAssist - Multilingual AI Assistant',
    teamName: 'Voice Pioneers',
    shortIdea: 'Voice-controlled AI assistant supporting 15 Indian languages for accessibility and convenience.',
    fullIdea: 'VoiceAssist democratizes technology access through natural language voice interaction in multiple Indian languages. The platform handles complex queries, controls smart home devices, provides information, sets reminders, and assists with daily tasks. Special features include dialect recognition, context awareness, and offline basic functionality.',
    technicalDetails: 'Built using Python with FastAPI backend. Speech recognition using Wav2Vec 2.0 fine-tuned on Indian language datasets. NLU using custom-trained transformer models. Text-to-speech using Coqui TTS. React web interface and Flutter mobile app. Redis for conversation context management. Implemented wake word detection using Porcupine.',
    reflection: 'This project highlighted the challenges of multilingual NLP, especially for low-resource languages. We learned about accent and dialect variations within languages. Optimizing for low latency was crucial for natural conversation flow. The biggest learning was understanding accessibility requirements and designing inclusive interfaces. We also gained experience in audio processing and noise cancellation.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&auto=format',
    technologies: ['Python', 'FastAPI', 'Transformers', 'Flutter', 'Redis', 'Wav2Vec'],
    category: 'AI/ML',
    teamMembers: ['Ishaan Mehta', 'Tanvi Bhatt', 'Nikhil Shetty'],
    featured: false
  },
  {
    id: '8',
    title: 'EventHub - Community Event Platform',
    teamName: 'Social Connect',
    shortIdea: 'Hyperlocal event discovery and management platform for college and community events.',
    fullIdea: 'EventHub connects people with local events through intelligent recommendations based on interests, location, and social connections. Users can discover, create, and manage events ranging from college fests to community gatherings. Features include ticketing, attendee management, event analytics, social sharing, and live event updates.',
    technicalDetails: 'Built with React and TypeScript frontend. Node.js backend with Express and MongoDB. Real-time features using Socket.io. Integrated payment gateway (Razorpay) for ticketing. Implemented geospatial queries for location-based search. Used Redis for caching and session management. Email notifications using SendGrid. PWA for mobile experience.',
    reflection: 'This project taught us about scalability challenges during event launches when traffic spikes dramatically. We implemented caching strategies and load balancing to handle concurrent users. Understanding payment gateway integration and handling edge cases was valuable. We learned about event-driven architecture and asynchronous processing for sending bulk notifications without blocking the main application.',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Socket.io', 'Redis'],
    category: 'Social',
    teamMembers: ['Aarav Chopra', 'Zara Ali', 'Kunal Rao'],
    featured: false
  }
];

export const categories = Array.from(new Set(projects.map(p => p.category)));
export const allTechnologies = Array.from(new Set(projects.flatMap(p => p.technologies))).sort();
