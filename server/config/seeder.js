const User = require('../models/User');
const Skill = require('../models/Skill');

const initialSkills = [
  { title: "Guitar fundamentals", cat: "craft", byName: "Aarav", email: "aarav@example.com", wants: "Spanish conversation" },
  { title: "React & Tailwind basics", cat: "tech", byName: "Meera", email: "meera@example.com", wants: "UI/UX feedback" },
  { title: "Home baking & sourdough", cat: "craft", byName: "Farah", email: "farah@example.com", wants: "Photography basics" },
  { title: "Conversational Japanese", cat: "language", byName: "Kenji", email: "kenji@example.com", wants: "Excel & spreadsheets" },
  { title: "Yoga & breathwork", cat: "wellness", byName: "Priya", email: "priya@example.com", wants: "Video editing" },
  { title: "Python for beginners", cat: "tech", byName: "Rohan", email: "rohan@example.com", wants: "Public speaking tips" },
  { title: "Watercolor painting", cat: "craft", byName: "Ila", email: "ila@example.com", wants: "Guitar fundamentals" },
  { title: "French conversation", cat: "language", byName: "Noah", email: "noah@example.com", wants: "Resume writing" },
  { title: "Meditation for beginners", cat: "wellness", byName: "Devika", email: "devika@example.com", wants: "Basic carpentry" },
];

async function seedInitialData() {
  try {
    const existingSkillsCount = await Skill.countDocuments();
    if (existingSkillsCount > 0) {
      return;
    }

    console.log('Seeding initial community skills and demo users...');

    // Create demo user
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Member',
        email: 'demo@example.com',
        password: 'password123',
        credits: 5.0,
      });
    }

    for (const item of initialSkills) {
      let user = await User.findOne({ email: item.email });
      if (!user) {
        user = await User.create({
          name: item.byName,
          email: item.email,
          password: 'password123',
          credits: 3.5,
        });
      }

      const skill = await Skill.create({
        title: item.title,
        cat: item.cat,
        wants: item.wants,
        owner: user._id,
      });

      user.skills.push(skill._id);
      await user.save();
    }

    console.log('Successfully seeded demo users and initial skills!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
}

module.exports = seedInitialData;
