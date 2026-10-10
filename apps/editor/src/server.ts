// Imported for its check alone: with an incomplete environment the server answers nothing but an error.
// oxlint-disable-next-line import/no-unassigned-import
import "#/config/env.ts";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
    fetch(request) {
        return handler.fetch(request);
    },
});
