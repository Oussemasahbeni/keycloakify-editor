import { createKcPageStory, type Meta, type StoryObj } from "../../mocks/KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "otp-form.ftl" });

const meta = {
    title: "login/extensions/otp-form.ftl",
    component: KcPageStory,
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInvalidCode: Story = {
    args: {
        kcContext: {
            messagesPerField: {
                existsError: (...fieldNames: string[]) => fieldNames.includes("totp"),
                get: (fieldName: string) => (fieldName === "totp" ? "Invalid access code." : ""),
            },
        },
    },
};

export const CodeResent: Story = {
    args: {
        kcContext: {
            message: { type: "info", summary: "A new access code has been sent to your email." },
        },
    },
};
