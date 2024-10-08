import {
    FaRobot,
    FaImage,
    FaUserMd,
    FaHardHat,
    FaLaptopCode,
    FaChalkboardTeacher,
    FaBriefcase,
    FaBook,
    FaMusic,
    FaCamera,
    FaChartLine,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';
export const AIPersonas = [
    {
        key: 'BABAGPT',
        name: 'BabaGPT',
        // role: 'Exclusive AI Based Search Engine!',
        role: "BABAGPT",
        icon: FaHardHat,
        color: 'from-blue-400 to-purple-500',
        engine: 'BabaGPT',
        engineCodeName: 'perplexity',
        modelCodeName: 'pplx-7b-online',
    },
    {
        key: 'CHATGPT',
        name: 'ChatGPT',
        role: 'CHATGPT',
        // role:"AI Assistant"
        icon: SiOpenai,
        color: 'from-green-400 to-blue-500',
        engine: 'OpenAI',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    // {
    //     key: 'DALLE',
    //     name: 'DALL-E',
    //     role: 'Image Generator',
    //     icon: FaImage,
    //     color: 'from-purple-400 to-pink-500',
    //     engine: 'OpenAI',
    //     engineCodeName: 'openai',
    //     modelCodeName: 'dall-e-3',
    // },
    {
        key: 'JINA',
        name: 'Hami Ras',
        role: 'Doctor',
        icon: FaUserMd,
        color: 'from-red-400 to-pink-500',
        engine: 'BabaGPT',
        engineCodeName: 'BabaGPT',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'ALBERTO',
        name: 'Emilio',
        role: 'Engineer',
        icon: FaHardHat,
        color: 'from-blue-400 to-indigo-500',
        engine: 'BabaGPT',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'ALEX',
        name: 'Alex',
        role: 'Business Advisor',
        icon: FaBriefcase,
        color: 'from-indigo-400 to-purple-500',
        engine: 'BabaGPT',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'Nika',
        name: 'Nika',
        role: 'Data Analyst',
        icon: FaChartLine,
        color: 'from-green-400 to-blue-500',
        engine: 'BabaGPT',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'Sarah',
        name: 'Sarah',
        role: 'Musician',
        icon: FaMusic,
        color: 'from-purple-400 to-indigo-500',
        engine: 'BabaGPT',
        engineCodeName: 'BabaGPT',
        modelCodeName: 'claude-3-opus-20240229',
    },
    // {
    //     key: 'CLAUDE',
    //     name: 'Claude',
    //     role: 'AI Assistant',
    //     icon: FaRobot,
    //     color: 'from-yellow-400 to-orange-500',
    //     engine: 'Claude',
    //     engineCodeName: 'claude',
    //     modelCodeName: 'claude-3-opus-20240229',
    // },
    {
        key: 'TAXHELPER',
        name: 'Alan',
        role: 'Tax Helper',
        icon: FaRobot,
        color: 'from-yellow-400 to-pink-500',
        engine: 'BabaGPT',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'Jack',
        name: 'Jack',
        role: 'Content Writer',
        icon: FaBook,
        color: 'from-pink-400 to-red-500',
        engine: 'BabaGPT',
        engineCodeName: 'claude',
        modelCodeName: 'claude-3-opus-20240229',
    },
    {
        key: 'KOOROSH',
        name: 'Koorosh',
        role: 'Developer',
        icon: FaLaptopCode,
        color: 'from-green-400 to-teal-500',
        engine: 'BabaGPT',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'Maryam',
        name: 'Maryam',
        role: 'Teacher',
        icon: FaChalkboardTeacher,
        color: 'from-yellow-400 to-red-500',
        engine: 'BabaGPT',
        engineCodeName: 'openai',
        modelCodeName: 'gpt-4o-mini-2024-07-18',
    },
    {
        key: 'MIA',
        name: 'Nicéphore',
        role: 'Photographer',
        icon: FaCamera,
        color: 'from-yellow-400 to-pink-500',
        engine: 'BabaGPT',
        engineCodeName: 'dalle',
        modelCodeName: 'dall-e-3',
    },
];