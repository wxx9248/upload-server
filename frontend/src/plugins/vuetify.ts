import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { mdi, aliases } from "vuetify/iconsets/mdi";
import "vuetify/styles";

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: "dark"
    },
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
            mdi
        }
    }
});

export default vuetify;
