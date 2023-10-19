import "react-native-get-random-values";
import { keyBy, merge } from "lodash";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Category, Evidence, Inspection, Observation } from "./interfaces";

/*
State shape

If an entity needs order then we will encounter { index: {}, ids: [] }
If it's not the case then it will simply be { index: {} }

Entities can be extracted via lodash.values
Order can be found in ids array
O(1) indexing is possible via index[some-id]

ids are strings, generated by nanoid locally for an offline-first experience
*/
interface State {
    sync: {
        loading: boolean;
    };
    auth: {
        logged: boolean;
        token?: string;
    };
    inspections: {
        index: Record<string, Inspection>;
        ids: number[];
    };
    categories: {
        index: Record<string, Category>;
        ids: number[];
    };
    observations: {
        index: Record<string, Observation>;
        ids: string[];
    };
    evidences: {
        index: Record<string, Evidence>;
        ids: string[];
    };
}

interface Actions {
    // base
    setSyncing: (val: boolean) => void;
    setAuth: (token?: string) => void;

    // categories
    setCategories: (categories: Category[]) => void;

    // inspections
    setInspections: (inspections: Inspection[]) => void;
    closeInspection: (inspectionId: string) => void;

    // observations
    createSimpleObservation: (observation: Omit<Observation, "id">) => void;
    createObservationWithEvidence: (arg: {
        observation: Omit<Observation, "id">;
        evidence: {
            filename: string;
        };
    }) => void;
}

export const useStore = create(
    immer<State & Actions>((set) => ({
        sync: {
            loading: false,
        },

        auth: {
            logged: false,
            token: undefined,
        },

        users: {
            index: {},
            ids: [],
        },

        inspections: {
            index: {},
            ids: [],
        },

        categories: {
            index: {},
            ids: [],
        },

        observations: {
            index: {},
            ids: [],
        },

        evidences: {
            index: {},
            ids: [],
        },

        setSyncing: (val: boolean) =>
            set((state) => {
                state.sync.loading = val;
            }),

        setAuth: (token) =>
            set((state) => {
                state.auth.logged = token !== undefined;
                state.auth.token = token;
            }),

        setCategories: (categories: Category[]) =>
            set((state) => {
                state.categories.index = keyBy(categories, "id");
                state.categories.ids = categories.map(
                    (category) => category.id
                );
            }),

        setInspections: (inspections) =>
            set((state) => {
                state.inspections.index = keyBy(inspections, "id");
                state.inspections.ids = inspections.map(
                    (inspection) => inspection.id
                );
            }),

        closeInspection: (id) =>
            set((state) => {
                state.inspections.index[id].status = "CLOSED";
                state.inspections.index[id].updatedAt = new Date();
            }),

        createSimpleObservation: (observation) =>
            set((state) => {
                const id = nanoid();
                state.observations.index[id] = merge(observation, { id });
                state.observations.ids.push(id);
            }),

        createObservationWithEvidence: ({ observation, evidence }) =>
            set((state) => {
                // insert new observation (copy paste from above)
                const observationId = nanoid();
                state.observations.index[observationId] = merge(observation, {
                    id: observationId,
                });
                state.observations.ids.push(observationId);

                // insert evidence, using observationId
                const id = nanoid();
                state.evidences.index[id] = merge(evidence, {
                    id,
                    observationId,
                });
                state.evidences.ids.push(id);
            }),
    }))
);
