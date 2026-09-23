// In a real backend this would come from GET /api/skills.
// SkillsContext's useEffect "fetches" this with a simulated delay,
// so the loading state is real to observe, not faked.
export const skillsData = [
  { id: 1, title: "Guitar fundamentals", cat: "craft", by: "Aarav", wants: "Spanish conversation" },
  { id: 2, title: "React & Tailwind basics", cat: "tech", by: "Meera", wants: "UI/UX feedback" },
  { id: 3, title: "Home baking & sourdough", cat: "craft", by: "Farah", wants: "Photography basics" },
  { id: 4, title: "Conversational Japanese", cat: "language", by: "Kenji", wants: "Excel & spreadsheets" },
  { id: 5, title: "Yoga & breathwork", cat: "wellness", by: "Priya", wants: "Video editing" },
  { id: 6, title: "Python for beginners", cat: "tech", by: "Rohan", wants: "Public speaking tips" },
  { id: 7, title: "Watercolor painting", cat: "craft", by: "Ila", wants: "Guitar fundamentals" },
  { id: 8, title: "French conversation", cat: "language", by: "Noah", wants: "Resume writing" },
  { id: 9, title: "Meditation for beginners", cat: "wellness", by: "Devika", wants: "Basic carpentry" },
];
