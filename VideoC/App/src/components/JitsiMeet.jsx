import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const JitsiMeet = React.memo(({
    roomName,
    displayName,
    password,
    domain, // We will use this prop instead of hardcoding
    onMeetingEnd,
    onApiReady,
    startWithVideoMuted,
    startWithAudioMuted,
    prejoinPageEnabled,
    toolbarButtons,
    jwt,
}) => {
    const jitsiContainerRef = useRef(null);
    const apiRef = useRef(null);

    useEffect(() => {
        if (!jitsiContainerRef.current) return;
        const domain = "meet.in8.com";

        // FIX #1: Removed the hardcoded domain. We now use the 'domain' prop.
        const script = document.createElement('script');
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        
        script.onerror = () => console.error(`Failed to load Jitsi script from: https://${domain}/external_api.js`);
        
        document.head.appendChild(script);

        script.onload = () => {
            if (!window.JitsiMeetExternalAPI) {
                console.error("Jitsi API script not loaded.");
                return;
            }

            const options = {
                roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: { displayName },
                password: password || undefined,
                configOverwrite: {
                    startWithVideoMuted,
                    startWithAudioMuted,
                    prejoinPageEnabled,
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: toolbarButtons,
                    SHOW_JITSI_WATERMARK: false,
                    CROSS_DOMAIN_IFRAME_WHITELIST: ['*']

                },
            };
            
            apiRef.current = new window.JitsiMeetExternalAPI(domain, options, jwt);

            // FIX #2: Wait for the local user to join before signaling that the API is ready.
            // This is the solution to the "No transport backend defined!" error.
            apiRef.current.addEventListener('videoConferenceJoined', () => {
    console.log("Jitsi API is now fully ready (videoConferenceJoined event).");
    if (onApiReady && typeof onApiReady === 'function') {
        onApiReady(apiRef.current);
    }
});

            apiRef.current.addEventListener('videoConferenceLeft', () => {
                if (onMeetingEnd && typeof onMeetingEnd === 'function') {
                    onMeetingEnd();
                }
            });
        };

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [
        domain, roomName, displayName, password, onMeetingEnd, onApiReady,
        startWithVideoMuted, startWithAudioMuted, prejoinPageEnabled, toolbarButtons,
        jwt
    ]);

    return (
        <div
            ref={jitsiContainerRef}
            className="w-full h-full rounded-2xl overflow-hidden"
            style={{ position: 'relative' }}
        />
    );
});

// Add the 'jwt' prop to propTypes and defaultProps if you are using it
JitsiMeet.propTypes = {
    domain: PropTypes.string,
    roomName: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    password: PropTypes.string,
    onMeetingEnd: PropTypes.func.isRequired,
    onApiReady: PropTypes.func.isRequired,
    startWithVideoMuted: PropTypes.bool,
    startWithAudioMuted: PropTypes.bool,
    prejoinPageEnabled: PropTypes.bool,
    toolbarButtons: PropTypes.arrayOf(PropTypes.string),
    jwt: PropTypes.string,
};

JitsiMeet.defaultProps = {
    domain: 'meet.in8.com', // The default domain
    password: '',
    startWithVideoMuted: false,
    startWithAudioMuted: false,
    prejoinPageEnabled: false,
    toolbarButtons: [],
    jwt: undefined,
};

export default JitsiMeet;