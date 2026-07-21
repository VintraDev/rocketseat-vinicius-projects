import Image from "next/image";
import { Avatar } from "./components/avatar";
import { LinkList } from "./components/link-list";
import { SocialMedias } from "./components/social-medias";

export default function Home() {
  return (
    <div className="relative h-screen w-screen">
      <Image 
        className="inset-0 absolute h-full w-full hidden md:block object-cover z-0"
        src="/backgrounds/bg-desktop.jpg"
        width={1440}
        height={1024}
        alt=""
      />

      <Image 
        className="inset-0 absolute h-full w-full md:hidden object-coverz z-0"
        src="/backgrounds/bg-mobile.jpg"
        width={260}
        height={800}
        alt=""
      />

      <div className="absolute z-10 text-white">
        <Avatar />
        <SocialMedias />
        <LinkList />
      </div>
    </div>
  );
}
