const CLIENT_ID = 'vFOvI7h7IFyxdWG6'; //W te '' wpisz swoje ID
if (CLIENT_ID === 'vFOvI7h7IFyxdWG6');
const ROOM_NAME = prompt("Wpisz nazwę pokoju:");

const DOM =
{
    chat: document.getElementById('chat'),
    message_form: document.getElementById('message_form'),
    message_button: document.getElementById('message_button'),
    users_info: document.getElementById('users_info'),
    plansza: document.getElementById("plansza"),
    button_start: document.getElementById("button_start"),
};

var private_data =
{
    host: false,
    import_chat: false,
    deck: [],
    gifts: [0, 0, 0, 0, 0, 0, 0],
    enemy_gifts: [0, 0, 0, 0, 0, 0, 0],
    hand: 0,
    my_turn: false,
    mode: '',
    mode_type: 0,
    actions: [],
    enemy_actions: [],
    card_counter: 0,
    safe_card: -1,
    enemy_safe_card: -1,
    safe_cards_visible: false,
    cards_to_send: [],
    likes: [],
};

var public_data =
{
    chat_text: [],
    game_started: false,
};

var cards =
{
    numbers: [2, 2, 2, 3, 3, 4, 5],
    colors: ['rgb(255, 0, 0)', 'rgb(225, 225, 0)', 'rgb(200, 0, 200)', 'rgb(100, 100, 255)',
        'rgb(255, 150, 50)', 'rgb(0, 200, 0)', 'rgb(255, 150, 150)'],
};

const drone = new ScaleDrone(CLIENT_ID,
    {
        data:
        { // Will be sent out as clientData via events
            name: prompt("Wpisz swoje imie:"),
            //name: 'Test'
        },
    });

var members = [];

drone.on('open', function (error)
{
    if (error)
    {
        return console.error(error);
    }
    console.log('Połączono ze Scaledrone');

    const room = drone.subscribe('observable-' + ROOM_NAME);
    room.on('open', function (error)
    {
        if (error)
        {
            return console.error(error);
        }
        console.log('Successfully joined room');
        Update_windows();
        Send_message('welcome', null);
    });

    room.on('members', function (m)
    {
        members = m;
        if (members.length === 1)
        {
            //Make_pawns();
            private_data.import_chat = true;
            private_data.host = true;   //pierwszy gracz zostaje hostem
            console.log('Miłościwie nam panujący host: ' + members[0].clientData.name);
        }
        Update_members();
    });

    room.on('member_join', function (member)
    {
        if (private_data.host)  //tylko host dodaje sobie osobę do listy
        {
            members.push(member);
            Update_members();
            Send_message('new_members', members);
        }
    });

    room.on('member_leave', function (id)
    {
        /*const index = members.findIndex(member => member.id === id);
        members.splice(index, 1);
        Update_members();*/
    });

    room.on('data', function (message, member)
    {
        if (member)
        {
            switch (message.type) 
            {
                case 'chat':
                    Add_message_to_chat(message.content, member);
                    break;
                case 'bot_chat':
                    Add_bot_chat(message.content, true);
                    break;
                case 'bot_info':
                    if (drone.clientId === message.recipient)
                        Add_bot_chat(message.content, false);
                    break;
                case 'welcome':
                    Add_bot_chat('Do pokoju dołączył ' + member.clientData.name);
                    if (private_data.host)
                    {
                        //console.log(data_public.chat_text);
                        Send_message('chat_import', public_data.chat_text);
                        Send_message('update', public_data);
                    }
                    //Stat_update();
                    break;
                case 'byby':
                    if (message.content != null)    //gracz żegnający się był hostem
                    {
                        console.log('Umarł host! Niech żyje host!');
                        var host_i = -100, my_i = -100;
                        for (var i = 0; i < members.length; i++)
                        {
                            if (members[i].id === drone.clientId)   //znaleziono siebie
                                my_i = i;
                            if (members[i].id === message.recipient)    //znaleziono hosta
                                host_i = i;
                        }
                        my_i++; //nowym hostem zostaje gracz poprzedni w tablicy (zapętlonej)
                        if (my_i >= members.length)
                            my_i -= members.length;
                        if (my_i === host_i)    //Ty jesteś nowym hostem
                        {
                            console.log("Zostałeś nowym hostem.");
                            private_data.host = true;
                            public_data = message.content;
                        }
                    }
                    Add_bot_chat('Pokój opuścił ' + member.clientData.name);
                    for (var i = 0; i < members.length; i++)    //ucinanie uczestnika z listy
                    {
                        if (members[i].id === member.id)
                        {
                            members.splice(i, 1);
                            Update_members();
                            break;
                        }
                    }
                    break;
                case 'chat_import':  //odświerzanie chatu dla nowych
                    if (!private_data.import_chat)  //nie ma importowanego chatu
                    {
                        //console.log(message.content);
                        DOM.chat.innerText = '';    //czyszczenie chatu
                        for (var i = 0; i < message.content.length; i++)
                            DOM.chat.appendChild(Create_message_element(message.content[i], 'color:black'));
                        private_data.import_chat = true;
                    }
                    break;
                case 'new_members': //aktualizacja listy członków
                    if (!private_data.host)  //niehosty aktualizują listę
                    {
                        members = message.content;
                        Update_members();
                    }
                    break;
                case 'update':
                    if (!private_data.host)
                        public_data = message.content;
                    Update_windows();
                    //Draw_board(data_private.board_draw, data_private.fraction);
                    break;
                case 'start_game':
                    if (private_data.host)
                    {
                        if (!public_data.game_started)
                        {
                            other_deck = Start_game_host();
                            Send_message('host_started_game', other_deck, private_data.my_turn);
                        }
                        else if (private_data.deck.length === 0)
                        {
                            other_deck = Start_round_host();
                            Send_message('host_started_round', other_deck);
                        }
                    }
                    break;
                case 'host_started_game':
                    if (!private_data.host)
                    {
                        private_data.deck = message.content;
                        private_data.my_turn = !message.recipient;
                    }
                    Start_game();
                    Add_bot_chat("Rozpoczęto grę!");
                    break;
                case 'host_started_round':
                    if (!private_data.host)
                    {
                        private_data.deck = message.content;
                    }
                    Start_round();
                    Add_bot_chat("Rozpoczęto następną rundę.");
                    break;
                /*case 'your_deck':
                    if (!private_data.host)
                        private_data.deck = message.content;
                    //console.log(private_data.host + ": " + private_data.deck);
                    Update_windows();
                    break;*/
                /*case 'first_turn':
                    if ((message.content === 1 && private_data.host) || (message.content === 0 && !private_data.host))
                    {
                        private_data.my_turn = true;
                        Start_turn();
                    }
                    Update_windows();
                    break;*/
                case 'action_play':
                    if (!private_data.my_turn)  //informowanie drugiego gracza, o wykonywanej akcji
                    {
                        private_data.enemy_actions[message.content] = 'in_use';
                        Update_windows();
                    }
                    break;
                case 'send_cards':
                    if (message.content.length > 2 && !private_data.my_turn)    //drugi gracz odbiera wysłane karty
                    {
                        private_data.cards_to_send = message.content;
                        Update_windows();
                    }
                    else if (message.content.length === 2 && private_data.my_turn)  //pozostałe karty wracają
                    {
                        private_data.gifts[message.content[0]]++;    //dodanie prezentów dla gejszy
                        private_data.gifts[message.content[1]]++;
                        Update_gifts();
                        Update_windows();
                        Send_message('next_turn', null);
                    }
                    break;
                case 'gifts_update':
                    if (message.recipient != private_data.host)  //określony adresat
                    {
                        private_data.enemy_gifts = message.content;
                        Update_windows();
                    }
                    break;
                case 'safe_card':
                    if (message.recipient != private_data.host)  //określony adresat
                    {
                        private_data.enemy_safe_card = message.content;
                        Send_message('next_turn', null);
                    }
                    break;
                case 'next_turn':
                    Next_turn();
                    break;
                case 'end_round':
                    End_round();
                    if (private_data.host)
                        End_round_host();
                    break;
                case 'winner':
                    if (private_data.host === message.content)
                        Add_bot_chat("Wygrałeś!!!");
                    else
                        Add_bot_chat("Przegrałeś, może następnym razem się uda.");
                    public_data.game_started = false;
                    break;
            }
        }
        else
        {
            // Wiadomośc od serwera, ignorujemy
        }
    });
});

drone.on('close', function (event)
{
    console.log('Connection was closed', event);
});

drone.on('error', function (error)
{
    console.error(error);
});

//Reackje na przyciski
DOM.message_button.addEventListener('click', function ()
{
    Message_form_confirm();
});

//Inne reakcje
DOM.message_form.addEventListener('keypress', function ()
{
    if (event.keyCode === 13)
    {
        event.preventDefault();
        Message_form_confirm();
    }
})

function Message_form_confirm()
{
    const value = DOM.message_form.value;
    if (value === '') 
    {
        return;
    }
    switch (value)
    {
        default:
            Send_message('chat', DOM.message_form.value)
    }
    DOM.message_form.value = '';
}

function Send_message(inputType, inputContent, id = null)
{
    drone.publish(
        {
            room: 'observable-' + ROOM_NAME,
            message:
            {
                type: inputType,
                content: inputContent,
                recipient: id,
            },
        });
}


//------------- HTMLowy stuff

function Update_members()
{
    DOM.users_info.innerText = ``;
    DOM.users_info.appendChild(Create_message_element(`${members.length} użytkowników w pokoju:`, 'color:black'));
    members.forEach(member =>
    {
        var text = member.clientData.name;
        if (member.id === drone.clientId)
            text += ' (Ty)';
        DOM.users_info.appendChild(Create_message_element(text, 'color:black'));
    })
}

function Update_windows()   //odświerzanie ekranu i okien
{
    Draw();
}

function Update_gifts()
{
    Send_message('gifts_update', private_data.gifts, private_data.host);
}

function Create_message_element(text, color)
{
    const el = document.createElement('div');
    el.appendChild(document.createTextNode(text));
    el.style = color;
    el.className = 'text_element';
    return el;
}

function Add_message_to_chat(text, member)
{
    const el = DOM.chat;
    var msg = Create_normal_message(member.clientData.name + ': ' + text, true);
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
}

function Add_bot_chat(text, public = true)
{
    const el = DOM.chat;
    var msg = Create_normal_message(text, public);
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
}

function Create_normal_message(text, public)
{
    var msg = Create_message_element(text, 'color:black');
    if (private_data.host && public)
    {
        //console.log('Przed: ' + data_public.chat_text);
        public_data.chat_text.push(text);
        //console.log('Po: ' + data_public.chat_text);
    }
    return msg;
}

function Before_closing()
{
    if (private_data.host)  //jeśli był hostem przekazuje dane
        Send_message('byby', public_data, drone.clientId);
    else
        Send_message('byby', null);
}

///////////////////////////////////////////////////

DOM.button_start.addEventListener("click", function ()
{
    if (members.length === 2)
    {
        if (!public_data.game_started || private_data.deck.length === 0)
            Send_message('start_game', null);
        else
            Add_bot_chat("Już rozpoczęto grę.");
    }
    else
        Add_bot_chat("Niewłaściwa liczba graczy.")
});
