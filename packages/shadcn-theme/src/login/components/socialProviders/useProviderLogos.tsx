import appleLogo from "./providers/apple.svg";
import bitbucketLogo from "./providers/bitbucket.svg";
import discordLogo from "./providers/discord.svg";
import facebookLogo from "./providers/facebook.svg";
import githubLogo from "./providers/github.svg";
import gitlabLogo from "./providers/gitlab.svg";
import googleLogo from "./providers/google.svg";
import instagramLogo from "./providers/instagram.svg";
import linkedinLogo from "./providers/linkedin.svg";
import microsoftLogo from "./providers/microsoft.svg";
import oidcLogo from "./providers/oidc.svg";
import openshiftLogo from "./providers/openshift.svg";
import paypalLogo from "./providers/paypal.svg";
import slackLogo from "./providers/slack.svg";
import stackoverflowLogo from "./providers/stackoverflow.svg";
import xLogo from "./providers/x.svg";

const useProviderLogos: () => Record<string, string> = () => ({
    apple: appleLogo,
    bitbucket: bitbucketLogo,
    discord: discordLogo,
    facebook: facebookLogo,
    github: githubLogo,
    gitlab: gitlabLogo,
    google: googleLogo,
    instagram: instagramLogo,
    linkedin: linkedinLogo,
    microsoft: microsoftLogo,
    oidc: oidcLogo,
    openshift: openshiftLogo,
    paypal: paypalLogo,
    slack: slackLogo,
    stackoverflow: stackoverflowLogo,
    twitter: xLogo,
    x: xLogo,
});

export default useProviderLogos;
