import { createKcPageStory, type Meta, type StoryObj } from "../../mocks/KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-token-form.ftl" });

const meta = {
    title: "login/extensions/login-token-form.ftl",
    component: KcPageStory,
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInvalidToken: Story = {
    args: {
        kcContext: {
            message: { type: "error", summary: "Invalid or expired login token. Please try again." },
        },
    },
};
