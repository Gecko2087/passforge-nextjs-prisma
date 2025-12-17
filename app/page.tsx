import FormCreatePassword from "@/components/dashboard/form-create-password";
import PasswordList from "@/components/dashboard/password-list";

export default function HomePage() {
    return (
        <div className="container mx-auto px-4">
            <FormCreatePassword />
            <PasswordList />
        </div>
    );
}
