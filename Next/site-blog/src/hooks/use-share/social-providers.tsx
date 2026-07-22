import { FaFacebook, FaLinkedin, FaSlack, FaXTwitter, FaThreads } from "react-icons/fa6";

export type ShareConfigProps = {
    url: string;
    title?: string;
    text?: string;
}

export type SocialProviderProps = 'linkedin' | 'facebook' | 'slack' | 'twitter' | 'threads' | 'clipboard';

export const SOCIAL_PROVIDERS = {
    linkedin: {
        name: 'LinkedIn',
        icon: <FaLinkedin className="h-4 w-4" />,
        shareUrl: (config: ShareConfigProps) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(config.url)}`
    },
    facebook: {
        name: 'Facebook',
        icon: <FaFacebook className="h-4 w-4" />,
        shareUrl: (config: ShareConfigProps) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(config.url)}`
    },
    slack: {
        name: 'Slack',
        icon: <FaSlack className="h-4 w-4" />,
        shareUrl: (config: ShareConfigProps) => `https://slack.com/share?url=${encodeURIComponent(config.url)}&text=${encodeURIComponent(config.title || '')}`
    },
    twitter: {
        name: 'Twitter',
        icon: <FaXTwitter className="h-4 w-4" />,
        shareUrl: (config: ShareConfigProps) => `https://x.com/intent/tweet?url=${encodeURIComponent(config.url)}&text=${encodeURIComponent(config.title || '')}`
    },
    threads: {
        name: 'threads',
        icon: <FaThreads className="h-4 w-4" />,
        shareUrl: (config: ShareConfigProps) => `https://threads.net/intent/post?text=${encodeURIComponent(`${config.title || ''} ${config.url}`)}`
    }
}