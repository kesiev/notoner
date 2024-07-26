RESOURCES_DECKS={
    load:(LANGUAGE,toolbox)=>{

        // --- Poker deck

        toolbox.addElement({
            id:"deck-poker",
            meta:{
                category:[ "cards" ],
                zIndex:10,
                title:LANGUAGE.elements.deck.poker.title,
                icon: "/images/icon-cards.svg",
                description:LANGUAGE.elements.deck.poker.description,
                options:[
                    {
                        title:LANGUAGE.elements.deck.poker.options.color.title,
                        attribute:"backgroundColor",
                        setting:{
                            type:"color"
                        }
                    },{
                        title:LANGUAGE.elements.deck.poker.options.backColor.title,
                        attribute:"cardBackColor",
                        setting:{
                            type:"radio",
                            options:[
                                {
                                    color:{ r:255, g:0, b:0, a:1 },
                                    value:0
                                },{
                                    color:{ r:0, g:0, b:255, a:1 },
                                    value:1
                                },{
                                    color:{ r:255, g:102, b:0, a:1 },
                                    value:2
                                },{
                                    color:{ r:255, g:255, b:0, a:1 },
                                    value:3
                                },{
                                    color:{ r:255, g:0, b:255, a:1 },
                                    value:4
                                },{
                                    color:{ r:0, g:255, b:0, a:1 },
                                    value:5
                                },{
                                    color:{ r:153, g:153, b:153, a:1 },
                                    value:6
                                },{
                                    color:{ r:128, g:128, b:0, a:1 },
                                    value:7
                                }
                            ]
                        }
                    },{
                        title:LANGUAGE.elements.deck.poker.options.addJokers.title,
                        description:LANGUAGE.elements.deck.poker.options.addJokers.description,
                        attribute:"addJokers",
                        setting:{
                            type:"checkbox",
                            default:false
                        }
                    }
                ]
            },
            onAdd:(data,json,uuid)=>{

                const
                    CARD_X=30,
                    CARD_Y=30,
                    CARD_COLS=13,
                    CARD_ROWS=4,
                    CARD_WIDTH=360,
                    CARD_HEIGHT=540,
                    TABLE_CARD_WIDTH=58,
                    TABLE_CARD_HEIGHT=88,
                    TABLE_CARD_GAPY=0.25,
                    TABLE_TRAY_GAP=10,
                    TABLE_TRAY_MARGIN = 10;

                let
                    areaWidth = TABLE_TRAY_MARGIN*3+TABLE_CARD_WIDTH*2,
                    areaHeight = TABLE_TRAY_MARGIN*2+TABLE_CARD_HEIGHT+TABLE_TRAY_GAP,
                    cardBackX = (CARD_WIDTH+CARD_X)*data.cardBackColor,
                    cardX = data.x+TABLE_TRAY_MARGIN,
                    cardY = data.y+TABLE_TRAY_MARGIN;

                function addCard(x,y) {

                    json.data.push({
                        type: "token-custom",
                        data: {
                            x: cardX,
                            y: cardY,
                            width: TABLE_CARD_WIDTH,
                            height: TABLE_CARD_HEIGHT,
                            tags: [
                                "card", "card-poker", "card-poker-"+x+"-"+y, "card-"+uuid, "card-"+uuid+"-"+x+"-"+y
                            ],
                            side:true,
                            isFlippable:true,
                            isRotating:true,
                            frame: {
                                borderRadius: 2,
                                borderSize: 0
                            },
                            image: {
                                borderRadius: 2,
                                image: {
                                    isResource: true,
                                    type: "url",
                                    url: "/images/elements/deck-poker-cards-front.svg",
                                    meta: {
                                        crop: {
                                            imageWidth: 5490,
                                            imageHeight: 2310,
                                            width: CARD_WIDTH,
                                            height: CARD_HEIGHT,
                                            x: CARD_X+(CARD_X+CARD_WIDTH)*x,
                                            y: CARD_Y+(CARD_Y+CARD_HEIGHT)*y
                                        }
                                    }
                                }
                            },
                            flipImage: {
                                borderRadius: 2,
                                image: {
                                    isResource: true,
                                    type: "url",
                                    url: "/images/elements/deck-poker-cards-back.svg",
                                    meta: {
                                        crop: {
                                            imageWidth: 3090,
                                            imageHeight: 540,
                                            width: CARD_WIDTH,
                                            height: CARD_HEIGHT,
                                            x: cardBackX,
                                            y: 0
                                        }
                                    }
                                }
                            },
                            onShakeMacro: false,
                            onClickMacro:{
                                forEach:{
                                    flip:true
                                }
                            },
                            isDragTopSurfaces:true,
                            mode: 0
                        }
                    });

                    cardY += TABLE_CARD_GAPY;
                }

                json.data.push({
                    type: "tray-cardshuffler",
                    data: {
                        x: data.x,
                        y: data.y,
                        width:areaWidth,
                        height:areaHeight,
                        backgroundColor: data.backgroundColor
                    }
                });

                for (let y=0;y<CARD_ROWS;y++)
                    for (let x=0;x<CARD_COLS;x++)
                        addCard(x,y);
                
                if (data.addJokers) {
                    addCard(CARD_COLS,0);
                    addCard(CARD_COLS,1);
                }

                data.width = areaWidth;
                data.height = areaHeight;

            }
        });
    }
}