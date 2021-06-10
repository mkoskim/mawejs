//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

export function FlexBox({style, children}) {
    return <div style={{display: "flex", ...style}}>{children}</div>;
}

export function VBox({style, children}) {
    return <FlexBox style={{flexDirection: "column", ...style}}>{children}</FlexBox>
}

export function HBox({style, children}) {
    return <FlexBox style={{flexDirection: "row", ...style}}>{children}</FlexBox>
}
