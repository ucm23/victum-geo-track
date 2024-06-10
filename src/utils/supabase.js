import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iofjaiiocyzebvardqkb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmphaWlvY3l6ZWJ2YXJkcWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY1ODExNjAsImV4cCI6MjAzMjE1NzE2MH0.5TVr8BsruWWI-l4LZzrXzaNbq-I0EKd9G2oT-I62X_w";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const pageSize = 10;

const colors = {
    null: 'gray',
    1: 'blue',
    2: 'green',
    3: 'gray'
}

export const getColorStatus = (id) => {
    return colors[id]
}

export const messagesNotificationTruck = {
    success: {
        message: 'Registro éxitoso',
    },
    error: {
        message: 'Error',
        description: 'Hubo un problema al enviar los datos. Por favor, inténtalo de nuevo.',
    },
    warning: {
        message: 'Advertencia'
    }
}

export const messagesNotificationLogin = {
    success: {
        message: 'Inicio éxitoso',
    },
    error: {
        message: 'Error',
        description: 'Hubo un problema al enviar los datos. Por favor, inténtalo de nuevo.',
    },
    warning: {
        message: 'Advertencia'
    }
}