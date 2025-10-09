import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Posts',
      href: getBlogPermalink(),
    },
    {
      text: 'About',
      href: getPermalink('about'),
    },
  ],
  actions: [{ text: 'GitHub', href: 'https://github.com/gjoris', target: '_blank' }],
};

export const footerData = {
  links: [],
  secondaryLinks: [
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/gjoris' },
    { ariaLabel: 'Linkedin', icon: 'tabler:brand-linkedin', href: 'https://linkedin.com/in/geroenjoris' },
  ],
  footNote: `
    Made by Geroen Joris · All rights reserved.
  `,
};