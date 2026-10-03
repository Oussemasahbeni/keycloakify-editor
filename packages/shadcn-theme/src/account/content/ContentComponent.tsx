/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/content/ContentComponent.tsx" --revert
 */

import type { ComponentType, LazyExoticComponent } from "react";
import { Suspense, lazy, useMemo } from "react";
import { useParams } from "react-router-dom";

import { Spinner } from "#/components/ui/spinner";

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useContent } from "../api/queries";
import type { MenuItem } from "../root/PageNav";
import type { ContentComponentParams } from "../routes";
import { joinPath } from "../utils/joinPath";

function findComponent(content: MenuItem[], componentId: string): string | undefined {
    for (const item of content) {
        if ("path" in item && item.path.endsWith(componentId) && "modulePath" in item) {
            return item.modulePath;
        }
        if ("children" in item) {
            return findComponent(item.children, componentId);
        }
    }
    return undefined;
}

/** Renders a custom content page declared in `content.json` (loaded from the theme's resources). */
export const ContentComponent = () => {
    const { data: content } = useContent();
    const { componentId } = useParams<ContentComponentParams>();

    const modulePath = useMemo(() => findComponent(content || [], componentId ?? ""), [content, componentId]);

    return modulePath && <Component modulePath={modulePath} />;
};

type ComponentProps = {
    modulePath: string;
};

/**
 * One lazy component per module URL, created once. Calling `lazy()` during render would make
 * a new component type on every render, so React would discard the loaded module, suspend
 * again and lose the page's state each time.
 */
const lazyModules = new Map<string, LazyExoticComponent<ComponentType>>();

function lazyModule(url: string): LazyExoticComponent<ComponentType> {
    let Module = lazyModules.get(url);
    if (!Module) {
        Module = lazy(() => import(/* @vite-ignore */ url));
        lazyModules.set(url, Module);
    }
    return Module;
}

const Component = ({ modulePath }: ComponentProps) => {
    const { environment } = useEnvironment();
    const Element = lazyModule(joinPath(environment.resourceUrl, modulePath));

    return (
        <Suspense
            fallback={
                <div className="flex justify-center p-8">
                    <Spinner className="size-6" />
                </div>
            }
        >
            {/* oxlint-disable-next-line react/static-components -- lazyModule() returns a cached component per URL; nothing is created during render */}
            <Element />
        </Suspense>
    );
};

export default ContentComponent;
