import { createKcPageStory, type Meta, type StoryObj } from "../../mocks/KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "email-confirmation.ftl" });

const meta = {
    title: "login/extensions/email-confirmation.ftl",
    component: KcPageStory,
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OtherBrowser: Story = {
    args: {
        kcContext: {
            magicLinkContinuation: { sameBrowser: false },
        },
    },
};
