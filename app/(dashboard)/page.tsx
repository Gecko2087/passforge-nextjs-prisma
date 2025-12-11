import FormCreatePassword from "./_components/form-create-password";
import PasswordLists from "./_components/password-list";

const DashboardPage = () => {
    return (
    <div className="container mx-auto px-4">
        <FormCreatePassword />
        <PasswordLists />
    </div>)
}

export default DashboardPage;