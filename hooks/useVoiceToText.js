// hooks/useVoiceToText.js
import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook that uses the Web Speech API (if available).
 * Single toggle usage: call startListening() or stopListening().
 * We'll track isListening and partial transcripts.
 */
export default function useVoiceToText(onFinalResult) {
    const [isListening, setIsListening] = useState(false);
    const [partialTranscript, setPartialTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Browser does not support SpeechRecognition');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;      // keep capturing
        recognition.interimResults = false;  // partial results
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            setPartialTranscript(interim);

            if (final.trim()) {
                onFinalResult(final);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setPartialTranscript('');
        };

        recognitionRef.current = recognition;
    }, [onFinalResult]);

    const startListening = () => {
        if (!recognitionRef.current) {
            alert('Your browser does not support SpeechRecognition.');
            return;
        }
        recognitionRef.current.start();
        setIsListening(true);
        setPartialTranscript('');
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return {
        isListening,
        partialTranscript,
        startListening,
        stopListening
    };
}
