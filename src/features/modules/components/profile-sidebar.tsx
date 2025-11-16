import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/features/users/components/profile-card";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ProfileSidebar = ({
  route = "",
  name = "",
}: {
  route: string;
  name: string;
}) => (
  <div className="lg:col-span-1 space-y-6 border-primary/10 md:border-r">
    <Link to={route} className="w-full flex justify-center items-center gap-2">
      <Button variant="ghost" size="sm" className="text-primary">
        <ChevronLeft className="w-4 h-4" />
        Regresar a {name}
      </Button>
    </Link>
    <ProfileCard variant="sidebar" />
  </div>
);

export default ProfileSidebar;
