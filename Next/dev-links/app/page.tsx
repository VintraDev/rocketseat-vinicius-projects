import Image from "next/image";
import { Avatar } from "../components/avatar";
import { LinkList } from "../components/link-list";
import { SocialMedias } from "../components/social-medias";
import { FaGithub, FaInstagram, FaLink, FaLinkedin, FaYoutube } from "react-icons/fa6";
import { JSX } from "react/jsx-runtime";
import { createClient } from "../prismicio";

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
      <Image
        className="inset-0 absolute h-full w-full hidden md:block object-cover -z-10"
        src="/backgrounds/bg-desktop.jpg"
        width={1440}
        height={1024}
        alt=""
      />

      <Image
        className="inset-0 absolute h-full w-full md:hidden object-cover -z-10"
        src="/backgrounds/bg-mobile.jpg"
        width={260}
        height={800}
        alt=""
      />

      <div className="inset-0 absolute z-0" />

      <div className="w-full max-w-md absolute z-10 text-white left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
        <Avatar />
        <LinkList links={meusLinks} />
        <SocialMedias social_medias={minhasRedesSociais} />
      </div>
    </div>
  );
}
