import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/language-context";
import { AdminLayout } from "@/components/layout/admin-layout";
import { FirebaseClientProvider } from "@/shims/firebase";
import { FeatureFlagsProvider } from "@/context/feature-flags-context";
import { AppContainer } from "@/components/layout/app-container";
import { ClientOnly } from "@/components/shared/client-only";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { PwaInstallBanner } from "@/components/shared/pwa-install-banner";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import About from "./pages/about";
import Activity from "./pages/activity";
import Admin from "./pages/admin";
import AdminAnalytics from "./pages/admin-analytics";
import AdminContent from "./pages/admin-content";
import AdminFeatures from "./pages/admin-features";
import AdminMessaging from "./pages/admin-messaging";
import AdminMonetization from "./pages/admin-monetization";
import AdminReports from "./pages/admin-reports";
import AdminUsers from "./pages/admin-users";
import Chats from "./pages/chats";
import ChatId from "./pages/_chats-chatId-adapter";
import Contest from "./pages/contest";
import Faq from "./pages/faq";
import Groups from "./pages/groups";
import GroupCategory from "./pages/groups-category";
import LegalDataProcessing from "./pages/legal-data-processing";
import LegalPrivacy from "./pages/legal-privacy";
import LegalTerms from "./pages/legal-terms";
import Login from "./pages/login";
import Onboarding from "./pages/onboarding";
import Profile from "./pages/profile";
import ProfileEdit from "./pages/profile-edit";
import ProfileAttachmentTest from "./pages/profile-attachment-test";
import Register from "./pages/register";
import Search from "./pages/search";
import SearchFilters from "./pages/search-filters";
import Settings from "./pages/settings";
import SupportChat from "./pages/support-chat";
import User from "./pages/user";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <FirebaseClientProvider>
            <FeatureFlagsProvider>
              <AppContainer>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
                    <Route index element={<Admin />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="features" element={<AdminFeatures />} />
                    <Route path="messaging" element={<AdminMessaging />} />
                    <Route path="monetization" element={<AdminMonetization />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                  <Route path="/chats" element={<Chats />} />
                  <Route path="/chats/:chatId" element={<ChatId />} />
                  <Route path="/contest" element={<Contest />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:category" element={<GroupCategory />} />
                  <Route path="/legal/data-processing" element={<LegalDataProcessing />} />
                  <Route path="/legal/privacy" element={<LegalPrivacy />} />
                  <Route path="/legal/terms" element={<LegalTerms />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<ProfileEdit />} />
                  <Route path="/profile/attachment-test" element={<ProfileAttachmentTest />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/search/filters" element={<SearchFilters />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support-chat" element={<SupportChat />} />
                  <Route path="/user" element={<User />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ClientOnly>
                  <CookieConsent />
                  <PwaInstallBanner />
                </ClientOnly>
              </AppContainer>
            </FeatureFlagsProvider>
          </FirebaseClientProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
