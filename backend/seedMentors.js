require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Mentor = require('./models/Mentor');
const connectDB = require('./config/db');

const mentorsData = [
  // Visual Arts
  {
    name: "Amara Okonkwo",
    email: "amara.okonkwo@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Award-winning visual artist specializing in contemporary African art. I blend traditional techniques with modern digital tools to create powerful narratives. With 12 years of experience exhibiting internationally, I'm passionate about nurturing the next generation of African artists.",
    profilePicture: "https://i.pravatar.cc/300?img=45",
    location: "Lagos, Nigeria",
    expertise: ["Painting", "Digital Art", "Mixed Media", "Art History", "Portfolio Development"],
    languages: ["English", "Yoruba", "Igbo"],
    pricePerSession: 45,
    experience: "12 years",
    education: "MFA in Fine Arts, University of Lagos",
    rating: 4.8,
    totalRatings: 24,
    completedSessions: 87,
    availability: ["Monday", "Wednesday", "Friday", "Saturday"]
  },
  {
    name: "Kwame Mensah",
    email: "kwame.mensah@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Graphic designer and illustrator with a passion for Afrofuturism and bold visual storytelling. I help creatives develop their unique style and build sustainable careers in the design industry.",
    profilePicture: "https://i.pravatar.cc/300?img=12",
    location: "Accra, Ghana",
    expertise: ["Graphic Design", "Illustration", "Branding", "Adobe Creative Suite", "UI/UX Design"],
    languages: ["English", "Twi", "French"],
    pricePerSession: 40,
    experience: "8 years",
    education: "BA in Graphic Design, Kwame Nkrumah University",
    rating: 4.9,
    totalRatings: 31,
    completedSessions: 102,
    availability: ["Tuesday", "Thursday", "Saturday"]
  },

  // Music & Audio
  {
    name: "Zara Diop",
    email: "zara.diop@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Music producer and sound engineer specializing in Afrobeats, Hip-Hop, and electronic music. I've worked with major artists across West Africa and can teach you everything from beat making to professional mixing and mastering.",
    profilePicture: "https://i.pravatar.cc/300?img=47",
    location: "Dakar, Senegal",
    expertise: ["Music Production", "Sound Engineering", "Beat Making", "Mixing & Mastering", "Ableton Live", "Logic Pro"],
    languages: ["French", "Wolof", "English"],
    pricePerSession: 55,
    experience: "10 years",
    education: "Diploma in Audio Engineering, SAE Institute",
    rating: 4.7,
    totalRatings: 19,
    completedSessions: 64,
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday"]
  },
  {
    name: "Mandla Khumalo",
    email: "mandla.khumalo@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Professional jazz pianist and composer. I teach music theory, composition, and performance techniques. Whether you're a beginner or advanced musician, I can help you reach your musical goals.",
    profilePicture: "https://i.pravatar.cc/300?img=33",
    location: "Johannesburg, South Africa",
    expertise: ["Piano", "Jazz Theory", "Music Composition", "Improvisation", "Music Arrangement"],
    languages: ["English", "Zulu", "Xhosa"],
    pricePerSession: 50,
    experience: "15 years",
    education: "Bachelor of Music, University of Cape Town",
    rating: 4.9,
    totalRatings: 42,
    completedSessions: 156,
    availability: ["Monday", "Wednesday", "Friday"]
  },

  // Writing & Literature
  {
    name: "Fatima Hassan",
    email: "fatima.hassan@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Published author and creative writing coach. I specialize in storytelling, narrative structure, and helping writers find their authentic voice. My work has been featured in international literary magazines.",
    profilePicture: "https://i.pravatar.cc/300?img=44",
    location: "Cairo, Egypt",
    expertise: ["Creative Writing", "Storytelling", "Novel Writing", "Poetry", "Publishing", "Literary Criticism"],
    languages: ["Arabic", "English", "French"],
    pricePerSession: 42,
    experience: "9 years",
    education: "MA in Creative Writing, American University in Cairo",
    rating: 4.8,
    totalRatings: 27,
    completedSessions: 93,
    availability: ["Tuesday", "Thursday", "Saturday", "Sunday"]
  },
  {
    name: "Chidi Okoro",
    email: "chidi.okoro@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Content strategist and copywriter helping brands tell compelling stories. I teach content marketing, SEO writing, and how to build a successful freelance writing career.",
    profilePicture: "https://i.pravatar.cc/300?img=15",
    location: "Nairobi, Kenya",
    expertise: ["Copywriting", "Content Strategy", "SEO Writing", "Digital Marketing", "Brand Storytelling"],
    languages: ["English", "Swahili"],
    pricePerSession: 38,
    experience: "7 years",
    education: "BA in Journalism, University of Nairobi",
    rating: 4.6,
    totalRatings: 22,
    completedSessions: 71,
    availability: ["Monday", "Tuesday", "Wednesday", "Friday"]
  },

  // Technology & Development
  {
    name: "Kofi Asante",
    email: "kofi.asante@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Full-stack software engineer and tech educator. I've built applications used by millions and now dedicate my time to teaching the next generation of African developers. Specializing in web development and mobile apps.",
    profilePicture: "https://i.pravatar.cc/300?img=52",
    location: "Kumasi, Ghana",
    expertise: ["Web Development", "JavaScript", "React", "Node.js", "Mobile App Development", "Python"],
    languages: ["English", "Twi"],
    pricePerSession: 60,
    experience: "11 years",
    education: "BSc Computer Science, KNUST",
    rating: 4.9,
    totalRatings: 38,
    completedSessions: 124,
    availability: ["Monday", "Wednesday", "Thursday", "Saturday"]
  },
  {
    name: "Aisha Mohammed",
    email: "aisha.mohammed@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "UX/UI designer passionate about creating intuitive digital experiences. I teach design thinking, user research, and how to use tools like Figma and Adobe XD to bring your ideas to life.",
    profilePicture: "https://i.pravatar.cc/300?img=48",
    location: "Kigali, Rwanda",
    expertise: ["UX Design", "UI Design", "Figma", "User Research", "Design Thinking", "Prototyping"],
    languages: ["English", "Kinyarwanda", "French"],
    pricePerSession: 52,
    experience: "6 years",
    education: "BSc Information Technology, University of Rwanda",
    rating: 4.7,
    totalRatings: 18,
    completedSessions: 56,
    availability: ["Tuesday", "Wednesday", "Thursday", "Sunday"]
  },

  // Film & Video
  {
    name: "Tendai Moyo",
    email: "tendai.moyo@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Award-winning filmmaker and cinematographer. I've directed documentaries and commercial projects across Africa. I teach visual storytelling, camera techniques, and video editing.",
    profilePicture: "https://i.pravatar.cc/300?img=57",
    location: "Harare, Zimbabwe",
    expertise: ["Filmmaking", "Cinematography", "Video Editing", "Documentary", "Premiere Pro", "DaVinci Resolve"],
    languages: ["English", "Shona"],
    pricePerSession: 48,
    experience: "13 years",
    education: "BA Film & Television, University of Zimbabwe",
    rating: 4.8,
    totalRatings: 25,
    completedSessions: 89,
    availability: ["Monday", "Tuesday", "Friday", "Saturday"]
  },
  {
    name: "Nkechi Adeyemi",
    email: "nkechi.adeyemi@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Video content creator and YouTube strategist. I've grown multiple channels to over 100k subscribers and can teach you content creation, editing, and how to monetize your passion.",
    profilePicture: "https://i.pravatar.cc/300?img=46",
    location: "Lagos, Nigeria",
    expertise: ["Content Creation", "YouTube Strategy", "Video Marketing", "Social Media", "Final Cut Pro"],
    languages: ["English", "Yoruba"],
    pricePerSession: 35,
    experience: "5 years",
    education: "BA Mass Communication, University of Lagos",
    rating: 4.9,
    totalRatings: 44,
    completedSessions: 167,
    availability: ["Monday", "Wednesday", "Friday", "Sunday"]
  },

  // Business & Entrepreneurship
  {
    name: "David Kimani",
    email: "david.kimani@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Serial entrepreneur and business coach. I've founded 3 successful startups and now help aspiring entrepreneurs validate ideas, secure funding, and scale their businesses.",
    profilePicture: "https://i.pravatar.cc/300?img=56",
    location: "Nairobi, Kenya",
    expertise: ["Entrepreneurship", "Business Strategy", "Fundraising", "Startup Growth", "Financial Planning"],
    languages: ["English", "Swahili", "Kikuyu"],
    pricePerSession: 65,
    experience: "14 years",
    education: "MBA, Strathmore Business School",
    rating: 4.8,
    totalRatings: 29,
    completedSessions: 98,
    availability: ["Tuesday", "Thursday", "Saturday"]
  },

  // Fashion & Design
  {
    name: "Thandiwe Nkosi",
    email: "thandiwe.nkosi@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Fashion designer celebrating African heritage through contemporary designs. I teach fashion illustration, pattern making, and how to launch your own fashion brand.",
    profilePicture: "https://i.pravatar.cc/300?img=49",
    location: "Cape Town, South Africa",
    expertise: ["Fashion Design", "Pattern Making", "Fashion Illustration", "Textile Design", "Brand Development"],
    languages: ["English", "Xhosa", "Afrikaans"],
    pricePerSession: 43,
    experience: "9 years",
    education: "Fashion Design Diploma, Cape Town Fashion Council",
    rating: 4.7,
    totalRatings: 21,
    completedSessions: 76,
    availability: ["Monday", "Wednesday", "Thursday", "Friday"]
  },

  // Photography
  {
    name: "Seydou Traore",
    email: "seydou.traore@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Professional photographer specializing in portrait and documentary photography. I teach camera fundamentals, composition, lighting, and post-processing to help you develop your photographic eye.",
    profilePicture: "https://i.pravatar.cc/300?img=51",
    location: "Bamako, Mali",
    expertise: ["Photography", "Portrait Photography", "Photo Editing", "Lightroom", "Photoshop", "Composition"],
    languages: ["French", "Bambara", "English"],
    pricePerSession: 40,
    experience: "11 years",
    education: "Professional Photography Certificate, Spéos Paris",
    rating: 4.9,
    totalRatings: 36,
    completedSessions: 128,
    availability: ["Tuesday", "Wednesday", "Friday", "Saturday"]
  },

  // Dance & Performance
  {
    name: "Amina Yusuf",
    email: "amina.yusuf@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Professional dancer and choreographer specializing in contemporary African dance. I've performed on international stages and teach dance techniques, choreography, and performance skills.",
    profilePicture: "https://i.pravatar.cc/300?img=43",
    location: "Addis Ababa, Ethiopia",
    expertise: ["Contemporary Dance", "African Dance", "Choreography", "Performance Art", "Dance Teaching"],
    languages: ["Amharic", "English"],
    pricePerSession: 38,
    experience: "10 years",
    education: "BA Performing Arts, Addis Ababa University",
    rating: 4.8,
    totalRatings: 20,
    completedSessions: 72,
    availability: ["Monday", "Tuesday", "Thursday", "Sunday"]
  },

  // Science & Education
  {
    name: "Dr. Chinonso Okafor",
    email: "chinonso.okafor@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "Physics professor and STEM education advocate. I make complex scientific concepts accessible and exciting. Specializing in physics, mathematics, and preparing students for university-level science.",
    profilePicture: "https://i.pravatar.cc/300?img=59",
    location: "Abuja, Nigeria",
    expertise: ["Physics", "Mathematics", "STEM Education", "Research Methods", "Academic Writing"],
    languages: ["English", "Igbo"],
    pricePerSession: 50,
    experience: "16 years",
    education: "PhD in Physics, University of Ibadan",
    rating: 4.9,
    totalRatings: 33,
    completedSessions: 142,
    availability: ["Monday", "Wednesday", "Friday", "Saturday"]
  },

  // Animation & 3D
  {
    name: "Malik Diallo",
    email: "malik.diallo@cre8.com",
    password: "password123",
    role: "mentor",
    bio: "3D artist and animator working in games and film. I teach 3D modeling, animation, and how to break into the gaming and animation industry.",
    profilePicture: "https://i.pravatar.cc/300?img=13",
    location: "Abidjan, Côte d'Ivoire",
    expertise: ["3D Modeling", "Animation", "Blender", "Maya", "Game Design", "Character Design"],
    languages: ["French", "English"],
    pricePerSession: 47,
    experience: "8 years",
    education: "BA Animation, ESMA Montpellier",
    rating: 4.7,
    totalRatings: 16,
    completedSessions: 54,
    availability: ["Tuesday", "Thursday", "Friday", "Sunday"]
  }
];

const seedMentors = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing mentors...');
    await Mentor.deleteMany({});
    
    console.log('👥 Creating mentor accounts...');
    
    for (const mentorData of mentorsData) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(mentorData.password, salt);
      
      const mentor = await Mentor.create({
        ...mentorData,
        password: hashedPassword
      });
      
      const expertiseStr = mentorData.expertise ? mentorData.expertise.join(', ') : 'N/A';
      console.log(`✅ Created mentor: ${mentor.name} - ${expertiseStr}`);
    }
    
    console.log('\n🎉 Successfully seeded', mentorsData.length, 'mentors!');
    console.log('\n📧 Login credentials for all mentors:');
    console.log('Password: password123\n');
    
    mentorsData.forEach(mentor => {
      console.log(`${mentor.name}: ${mentor.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding mentors:', error);
    process.exit(1);
  }
};

seedMentors();
