
import { Box } from "lucide-react";
import { useOutletContext } from "react-router";

const Navbar = () => {
    const { isSignedIn, userName, signIn, signOut, refreshAuth } = useOutletContext<AuthContext>();
    const handleAuthClick = async () => {
        console.log("Navbar: handleAuthClick called, isSignedIn:", isSignedIn);
        if (isSignedIn) {
            try {
                console.log("Navbar: calling signOut");
                await signOut();
            } catch (e) {
                console.error(`puter sign out failed: ${e}`);
            }
            return;
        }
        try {
            console.log("Navbar: calling signIn");
            await signIn();
        } catch (e) {
            console.error(`puter sign in failed: ${e}`);
        }
    };
    return (
        <div>
            <header className="navbar">
                <nav className="inner">
                    <div className="left">
                        <div className="brand">
                            <Box className="logo"></Box>
                            <span className="name">
                                Room
                            </span>
                        </div>
                        <ul className="links">
                            <a href="#">product</a>
                            <a href="#">pricing</a>
                            <a href="#">comunity</a>
                            <a href="#">enterprise</a>
                        </ul>
                    </div>
                    <div className="actions">
                        {isSignedIn ? (
                            <>
                                <span className="greeting">hello {userName}</span>
                                <button onClick={handleAuthClick} className="cta">logout</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleAuthClick} className="login">login</button>
                                <a href="#upload" className="cta">get started</a>
                            </>
                        )}

                    </div>
                </nav>
            </header>
        </div>
    )
}

export default Navbar;
