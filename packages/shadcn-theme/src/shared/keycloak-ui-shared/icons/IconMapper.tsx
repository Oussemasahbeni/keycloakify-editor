/**
 * This file has been claimed for ownership from @keycloakify/keycloak-ui-shared version 260700.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/icons/IconMapper.tsx" --revert
 */

import type { IconType } from "react-icons";
import {
    FaBitbucket,
    FaCube,
    FaFacebookSquare,
    FaGithub,
    FaGitlab,
    FaGoogle,
    FaInstagram,
    FaLinkedin,
    FaMicrosoft,
    FaPaypal,
    FaStackOverflow,
    FaTwitter,
} from "react-icons/fa";
import { SiRedhatopenshift } from "react-icons/si";

type IconMapperProps = {
    icon: string;
    className?: string;
};

/** Brand icon for an identity provider alias (linked accounts). */
export const IconMapper = ({ icon, className = "size-6" }: IconMapperProps) => {
    const SpecificIcon = getIcon(icon);
    // oxlint-disable-next-line react/static-components -- getIcon returns one of a fixed set of module-level icon components; nothing is created during render
    return <SpecificIcon aria-label={icon} className={className} />;
};

function getIcon(icon: string): IconType {
    switch (icon) {
        case "github":
            return FaGithub;
        case "facebook":
            return FaFacebookSquare;
        case "gitlab":
            return FaGitlab;
        case "google":
            return FaGoogle;
        case "linkedin":
        case "linkedin-openid-connect":
            return FaLinkedin;
        case "openshift-v4":
            return SiRedhatopenshift;
        case "stackoverflow":
            return FaStackOverflow;
        case "twitter":
            return FaTwitter;
        case "microsoft":
            return FaMicrosoft;
        case "bitbucket":
            return FaBitbucket;
        case "instagram":
            return FaInstagram;
        case "paypal":
            return FaPaypal;
        default:
            return FaCube;
    }
}
