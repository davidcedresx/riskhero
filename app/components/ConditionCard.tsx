import { StyleSheet } from "react-native";
import Typography from "./Typography";
import VStack from "./VStack";
import { FC } from "react";
import {
    Condition,
    State,
    getStateColor,
    getStateIcon,
    getStateLabel,
} from "../state/interfaces";
import HStack from "./HStack";
import Feather from "@expo/vector-icons/Feather";

const ConditionCard: FC<{ condition: Condition; state?: State }> = ({
    condition,
    state,
}) => {
    return (
        <HStack style={styles.base}>
            <VStack style={{ flex: 1 }}>
                <Typography variant="subtitle">{condition.name}</Typography>

                <Typography variant="body">
                    {state === undefined ? "Pendiente" : getStateLabel(state)}
                </Typography>
            </VStack>

            {state !== undefined && (
                <Feather
                    size={32}
                    name={getStateIcon(state)}
                    color={getStateColor(state)}
                    style={{ marginRight: 16 }}
                />
            )}
        </HStack>
    );
};

const styles = StyleSheet.create({
    base: {
        borderColor: "#e2e8f0",
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
});

export default ConditionCard;
