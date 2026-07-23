import { Avatar } from "../components/avatar";
import { LinkList } from "../components/link-list";
import { SocialMedias } from "../components/social-medias";
import { FaGithub, FaInstagram, FaLink, FaLinkedin, FaYoutube } from "react-icons/fa6";
import { JSX } from "react/jsx-runtime";
import { createClient } from "../prismicio";
import { ThemeSwitch } from "@/components/theme-switch";
import { BackgroundImage } from "@/components/background-image";

type PrismicLinkItem = {
  link: {
    link_type: string;
    key: string;
    url: string;
  };
  textlink: {
    text: string;
  }[];
};

type PrismicSocialItem = {
  icon: string; // ex: "youtube" digitado no CMS
  link: {
    url: string;
  };
};

export default async function Home() {

  const client = createClient();
  const page = await client.getSingle("home");

  const socialIcons: Record<string, JSX.Element> = {
    instagram: <FaInstagram className="size-6" />,
    github: <FaGithub className="size-6" />,
    youtube: <FaYoutube className="size-6" />,
    linkedin: <FaLinkedin className="size-6" />
  };

  console.log(page.data.socials[0].link.url)

  const meusLinks = page.data.links.map((item: PrismicLinkItem) => (
    {
      link: item.link.url,
      text: item.textlink[0].text
    }));

  const minhasRedesSociais = page.data.socials.map((item: PrismicSocialItem) => {

    const key = item.icon.toLowerCase();

    return {
      link: item.link.url,
      icon: socialIcons[key] || <FaLink />
    };
  })

  return (
    <div className="relative h-screen w-screen">
      <BackgroundImage />

      <div className="inset-0 absolute z-0" />

      <div className="w-full max-w-lg p-6 absolute z-10 text-(--text-color) left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
        <Avatar />
        <ThemeSwitch />
        <LinkList links={meusLinks} />
        <SocialMedias social_medias={minhasRedesSociais} />
      </div>
    </div>
  );
}
