import { Link } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";

import { SURFACES } from "../shared/model/surface";

export function SurfaceSwitch() {
    return (
        <ButtonGroup>
            {SURFACES.map(({ value: surface, label, to, icon: Icon }) => {
                return (
                    <Link
                        key={surface}
                        to={to}
                        data-slot="button"
                        activeProps={{ className: buttonVariants({ variant: "default", size: "sm" }) }}
                        inactiveProps={{ className: buttonVariants({ variant: "outline", size: "sm" }) }}
                    >
                        <Icon data-icon="inline-start" />
                        {label}
                    </Link>
                );
            })}
        </ButtonGroup>
    );
}
