import { router } from "expo-router";
import { useStore } from "../../../state/store";
import { View } from "react-native";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import VStack from "../../../components/VStack";

const Profile = () => {
    const { setAuth } = useStore();

    const handleLogout = () => {
        setAuth(undefined);
        router.replace("/sign-in");
    };

    return (
        <View
            style={{
                padding: 32,
                flex: 1,
                justifyContent: "space-between",
                backgroundColor: "white",
            }}
        >
            <VStack>
                <Avatar />
                <Typography variant="section">David Cedres</Typography>
                <Typography variant="body">v27340336</Typography>
            </VStack>
            <Button onPress={handleLogout}>Cerrar Sesión</Button>
        </View>
    );
};

export default Profile;
