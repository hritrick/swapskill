import Navbar from "./Navbar.jsx";
import Hero from "./Hero.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Browse from "./Browse.jsx";
import Stories from "./Stories.jsx";
import Footer from "./Footer.jsx";
import ListSkillModal from "./ListSkillModal.jsx";
import ProposalModal from "./ProposalModal.jsx";
import { useModal } from "../hooks/useModal.js";

// This is the original SwapSkill app experience (Hero/Browse/Stories/etc.),
// now mounted at /dashboard behind ProtectedRoute instead of gating the
// entire app. All the existing functionality is unchanged.
export default function Dashboard() {
  const listModal = useModal();

  return (
    <>
      <Navbar onListSkill={listModal.open} />
      <Hero onListSkill={listModal.open} />
      <HowItWorks />
      <Browse />
      <Stories />
      <Footer />
      <ListSkillModal modal={listModal} />
      <ProposalModal />
    </>
  );
}
