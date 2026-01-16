export interface WorkshopMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  registeredAt: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  duration: string;
  instructor: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalSeats: number;
  enrolledCount: number;
  members: WorkshopMember[];
  isFree: boolean;
  price?: number;
  platform: string;
  guests?: string[];
}

// Dummy workshop data
export const workshopsData: Workshop[] = [
  {
    id: 'ws-1',
    title: 'Advanced React Patterns',
    description: 'Deep dive into advanced React patterns including render props, compound components, and hooks composition. Learn how to build scalable and maintainable React applications.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
    startDate: '2026-02-15',
    endDate: '2026-02-17',
    duration: '3 days',
    instructor: 'Sarah Johnson',
    category: 'Frontend Development',
    status: 'upcoming',
    totalSeats: 50,
    enrolledCount: 32,
    isFree: false,
    price: 299,
    platform: 'Zoom',
    guests: ['John Smith - React Core Team', 'Emma Wilson - Meta Engineer'],
    members: [
      {
        id: 'm-1',
        name: 'Alex Chen',
        email: 'alex.chen@example.com',
        registeredAt: '2026-01-10',
      },
      {
        id: 'm-2',
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        registeredAt: '2026-01-11',
      },
      {
        id: 'm-3',
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        registeredAt: '2026-01-12',
      },
      {
        id: 'm-4',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        registeredAt: '2026-01-13',
      },
      {
        id: 'm-5',
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        registeredAt: '2026-01-14',
      },
    ],
  },
  {
    id: 'ws-2',
    title: 'TypeScript Masterclass',
    description: 'Master TypeScript from basics to advanced topics. Learn type inference, generics, utility types, and how to build type-safe applications.',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop',
    startDate: '2026-02-20',
    endDate: '2026-02-22',
    duration: '3 days',
    instructor: 'David Kim',
    category: 'Programming Languages',
    status: 'upcoming',
    totalSeats: 40,
    enrolledCount: 28,
    isFree: false,
    price: 249,
    platform: 'Microsoft Teams',
    guests: ['Anders Hejlsberg - TypeScript Creator'],
    members: [
      {
        id: 'm-6',
        name: 'Sophie Turner',
        email: 'sophie.turner@example.com',
        registeredAt: '2026-01-08',
      },
      {
        id: 'm-7',
        name: 'Daniel Lee',
        email: 'daniel.lee@example.com',
        registeredAt: '2026-01-09',
      },
      {
        id: 'm-8',
        name: 'Rachel Green',
        email: 'rachel.green@example.com',
        registeredAt: '2026-01-10',
      },
      {
        id: 'm-9',
        name: 'Tom Anderson',
        email: 'tom.anderson@example.com',
        registeredAt: '2026-01-15',
      },
    ],
  },
  {
    id: 'ws-3',
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamentals of user interface and user experience design. Create beautiful and functional designs that users love.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
    startDate: '2026-03-01',
    endDate: '2026-03-03',
    duration: '3 days',
    instructor: 'Lisa Anderson',
    category: 'Design',
    status: 'upcoming',
    totalSeats: 35,
    enrolledCount: 18,
    isFree: true,
    platform: 'Google Meet',
    guests: ['Steve Krug - Usability Expert', 'Don Norman - Design Thinker'],
    members: [
      {
        id: 'm-10',
        name: 'Jessica White',
        email: 'jessica.white@example.com',
        registeredAt: '2026-01-16',
      },
      {
        id: 'm-11',
        name: 'Kevin Martinez',
        email: 'kevin.martinez@example.com',
        registeredAt: '2026-01-16',
      },
      {
        id: 'm-12',
        name: 'Olivia Taylor',
        email: 'olivia.taylor@example.com',
        registeredAt: '2026-01-16',
      },
    ],
  },
  {
    id: 'ws-4',
    title: 'Full Stack Development Bootcamp',
    description: 'Intensive bootcamp covering React, Node.js, databases, and deployment. Build and deploy a complete web application from scratch.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
    startDate: '2026-01-10',
    endDate: '2026-01-25',
    duration: '15 days',
    instructor: 'Mike Ross',
    category: 'Full Stack',
    status: 'ongoing',
    totalSeats: 60,
    enrolledCount: 56,
    isFree: false,
    price: 899,
    platform: 'Zoom',
    guests: ['Brad Traversy - Instructor', 'Wes Bos - Developer'],
    members: [
      {
        id: 'm-25',
        name: 'Tony Stark',
        email: 'tony.stark@example.com',
        registeredAt: '2025-12-20',
      },
      {
        id: 'm-26',
        name: 'Natasha Romanoff',
        email: 'natasha.romanoff@example.com',
        registeredAt: '2025-12-21',
      },
      {
        id: 'm-27',
        name: 'Steve Rogers',
        email: 'steve.rogers@example.com',
        registeredAt: '2025-12-22',
      },
      {
        id: 'm-28',
        name: 'Bruce Banner',
        email: 'bruce.banner@example.com',
        registeredAt: '2025-12-23',
      },
    ],
  },
  {
    id: 'ws-5',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native. Learn navigation, state management, and native features integration.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
    startDate: '2026-01-13',
    endDate: '2026-01-20',
    duration: '8 days',
    instructor: 'Rachel Kim',
    category: 'Mobile Development',
    status: 'ongoing',
    totalSeats: 45,
    enrolledCount: 38,
    isFree: false,
    price: 449,
    platform: 'Discord',
    guests: ['Evan Bacon - Expo Team', 'William Candillon - React Native Expert'],
    members: [
      {
        id: 'm-29',
        name: 'Clark Kent',
        email: 'clark.kent@example.com',
        registeredAt: '2025-12-28',
      },
      {
        id: 'm-30',
        name: 'Barry Allen',
        email: 'barry.allen@example.com',
        registeredAt: '2025-12-29',
      },
      {
        id: 'm-31',
        name: 'Arthur Curry',
        email: 'arthur.curry@example.com',
        registeredAt: '2025-12-30',
      },
    ],
  },
  {
    id: 'ws-6',
    title: 'Python for Data Science',
    description: 'Comprehensive workshop on using Python for data analysis, visualization, and machine learning with pandas, matplotlib, and scikit-learn.',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    duration: '3 days',
    instructor: 'Dr. Robert Chen',
    category: 'Data Science',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
    totalSeats: 45,
    enrolledCount: 45,    isFree: false,
    price: 349,
    platform: 'Zoom',
    guests: ['Wes McKinney - Pandas Creator', 'Jake VanderPlas - Data Scientist'],    members: [
      {
        id: 'm-13',
        name: 'Andrew Smith',
        email: 'andrew.smith@example.com',
        registeredAt: '2025-11-15',
      },
      {
        id: 'm-14',
        name: 'Laura Johnson',
        email: 'laura.johnson@example.com',
        registeredAt: '2025-11-16',
      },
      {
        id: 'm-15',
        name: 'Chris Brown',
        email: 'chris.brown@example.com',
        registeredAt: '2025-11-17',
      },
      {
        id: 'm-16',
        name: 'Nina Patel',
        email: 'nina.patel@example.com',
        registeredAt: '2025-11-18',
      },
      {
        id: 'm-17',
        name: 'Mark Wilson',
        email: 'mark.wilson@example.com',
        registeredAt: '2025-11-19',
      },
    ],
  },
  {
    id: 'ws-7',
    title: 'Node.js & Express Backend',
    description: 'Build robust backend applications with Node.js and Express. Learn RESTful APIs, authentication, database integration, and deployment.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop',
    startDate: '2025-11-20',
    endDate: '2025-11-22',
    duration: '3 days',
    instructor: 'Mike Thompson',
    category: 'Backend Development',
    status: 'completed',
    totalSeats: 50,
    enrolledCount: 42,
    isFree: false,
    price: 299,
    platform: 'Zoom',
    guests: ['Ryan Dahl - Node.js Creator'],
    members: [
      {
        id: 'm-18',
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
        registeredAt: '2025-10-25',
      },
      {
        id: 'm-19',
        name: 'John Doe',
        email: 'john.doe@example.com',
        registeredAt: '2025-10-26',
      },
      {
        id: 'm-20',
        name: 'Emma Watson',
        email: 'emma.watson@example.com',
        registeredAt: '2025-10-27',
      },
      {
        id: 'm-21',
        name: 'Ryan Gosling',
        email: 'ryan.gosling@example.com',
        registeredAt: '2025-10-28',
      },
    ],
  },
  {
    id: 'ws-8',
    title: 'Cloud Computing with AWS',
    description: 'Learn how to deploy and manage applications on Amazon Web Services. Cover EC2, S3, Lambda, RDS, and more.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    startDate: '2025-10-15',
    endDate: '2025-10-17',
    duration: '3 days',
    instructor: 'Jennifer Lee',
    category: 'Cloud & DevOps',
    status: 'completed',
    totalSeats: 30,
    enrolledCount: 30,
    isFree: true,
    platform: 'Microsoft Teams',
    guests: ['Werner Vogels - Amazon CTO'],
    members: [
      {
        id: 'm-22',
        name: 'Peter Parker',
        email: 'peter.parker@example.com',
        registeredAt: '2025-09-20',
      },
      {
        id: 'm-23',
        name: 'Bruce Wayne',
        email: 'bruce.wayne@example.com',
        registeredAt: '2025-09-21',
      },
      {
        id: 'm-24',
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        registeredAt: '2025-09-22',
      },
    ],
  },
];

// Helper functions
export const getUpcomingWorkshops = () => 
  workshopsData.filter(w => w.status === 'upcoming');

export const getOngoingWorkshops = () => 
  workshopsData.filter(w => w.status === 'ongoing');

export const getCompletedWorkshops = () => 
  workshopsData.filter(w => w.status === 'completed');

export const getWorkshopById = (id: string) => 
  workshopsData.find(w => w.id === id);

export const addWorkshop = (workshop: Workshop) => {
  workshopsData.push(workshop);
};
