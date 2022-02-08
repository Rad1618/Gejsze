function Start_game_host()
{
    public_data.game_started = true;
    Send_message('update', public_data);
    private_data.my_turn = Math.round(Math.random());   //losowanie gracza zaczynającego
    return Start_round_host();
}

function Start_game()
{
    private_data.likes = [];
    for (var i = 0; i < cards.numbers.length; i++)
        private_data.likes.push('no_one');
    Start_round();
    Update_windows();
    //console.log(private_data.actions);
}

function Start_round_host()
{
    private_data.deck = [];
    var deck = [];
    for (var i = 0; i < cards.numbers.length; i++)  //tworzenie talii kart
    {
        for (var j = 0; j < cards.numbers[i]; j++)
        {
            deck.push(i);
        }
    }
    for (var i = 0; i < deck.length; i++)   //tasowanie
    {
        var random_index = Math.round(Math.random() * deck.length);
        if (random_index === deck.length)
            random_index = 0;
        [deck[i], deck[random_index]] = [deck[random_index], deck[i]];
    }
    other_deck = [];
    for (var i = 1; i < deck.length; i++)   //karta 0 nie bierze udziału w grze
    {
        if (i % 2 === 0)    //rozdawanie kart
            private_data.deck.push(deck[i]);
        else
            other_deck.push(deck[i]);
    }
    return other_deck;
    //Send_message('your_deck', other_deck);
}

function Start_round()
{
    for (var i = 0; i < 4; i++)
    {
        private_data.actions[i] = 'active';
        private_data.enemy_actions[i] = 'active';
    }
    private_data.gifts = [0, 0, 0, 0, 0, 0, 0];
    private_data.enemy_gifts = [0, 0, 0, 0, 0, 0, 0];
    private_data.safe_card = -1;
    private_data.enemy_safe_card = -1;
    private_data.safe_cards_visible = false;
    private_data.hand += 6;
    Next_turn();    //rozpoczęcie następnej tury
    Update_windows();
}

function Start_turn()
{
    private_data.hand++;
    private_data.mode = 'action';
    Update_windows();
}

function Next_turn()
{
    private_data.my_turn = !private_data.my_turn;
    for (var i = 0; i < private_data.enemy_actions.length; i++)
    {
        if (private_data.enemy_actions[i] === 'in_use')
            private_data.enemy_actions[i] = 'used';
    }
    if (private_data.my_turn)
    {
        if (private_data.deck.length > 0)
        {
            Start_turn();
        }
        else   //koniec kart
        {
            Send_message('end_round', null); //wysyłanie informacji o rozpoczęciu podsumowania
        }
    }
    Update_windows();
}

function End_round()
{
    private_data.gifts[private_data.safe_card]++;   //dodanie bezpiecznych kart do prezentów
    private_data.enemy_gifts[private_data.enemy_safe_card]++;
    private_data.safe_cards_visible = true;
    for (var i = 0; i < cards.numbers.length; i++)
    {
        if (private_data.gifts[i] > private_data.enemy_gifts[i])
            private_data.likes[i] = 'me';
        else if (private_data.gifts[i] < private_data.enemy_gifts[i])
            private_data.likes[i] = 'enemy';
    }
    Update_windows();
}

function End_round_host()
{
    my_points = 0;
    enemy_points = 0;
    my_number = 0;
    enemy_number = 0;
    for (var i = 0; i < cards.numbers.length; i++)
    {
        if (private_data.likes[i] === 'me')
        {
            my_points += cards.numbers[i];
            my_number++;
        }
        else if (private_data.likes[i] === 'enemy')
        {
            enemy_points += cards.numbers[i];
            enemy_number++;
        }
    }
    //console.log(my_number + " " + my_points + " " + enemy_number + " " + enemy_points);
    if (my_points >= 11)    //sprawdzanie, czy któryś gracz wygrał
        Send_message('winner', private_data.host);
    else if (enemy_points >= 11)
        Send_message('winner', !private_data.host);
    else if (my_number >= 4)
        Send_message('winner', private_data.host);
    else if (enemy_number >= 4)
        Send_message('winner', !private_data.host);
}

DOM.plansza.addEventListener('mousedown', function (e)
{
    Board_click(e.offsetX, e.offsetY);
});

function Board_click(pos_x, pos_y)
{
    if (private_data.my_turn)
    {
        switch (private_data.mode)
        {
            case 'action':
                for (var i = 0; i < 4; i++) //kliknięcie na akcję
                {
                    if (private_data.actions[i] === 'active' && pos_x >= (i + 1) * 50 && pos_x <= (i + 1) * 50 + 40 && pos_y >= 500 && pos_y <= 540)
                    {
                        private_data.actions[i] = 'in_use';
                        private_data.mode = 'cards';
                        private_data.cards_to_send = [],
                        private_data.mode_type = i + 1;
                        private_data.card_counter = i + 1;
                        Send_message('action_play', i);
                        Update_windows();
                    }
                }
                break;
            case 'cards':
                for (var i = 0; i < private_data.hand; i++)
                {
                    if (pos_x >= (i + 1) * 50 && pos_x <= (i + 1) * 50 + 25 && pos_y >= 400 && pos_y <= 425)
                    {
                        switch (private_data.mode_type)
                        {
                            case 1: //bezpieczna karta
                                private_data.safe_card = private_data.deck[i];
                                break;
                            case 2: //likwidacja kart
                                //wszystko to usówanie karty, co zostało wykonane pod spodem
                                break;
                            case 3: case 4:
                                private_data.cards_to_send.push(private_data.deck[i]);
                                break;
                        }
                        private_data.hand--;
                        private_data.deck.splice(i, 1); //usówanie karty z ręki
                        private_data.card_counter--;
                        if (private_data.card_counter <= 0)
                        {
                            private_data.actions[private_data.mode_type - 1] = 'used';
                            private_data.mode = 'rest';
                            if (private_data.mode_type === 3 || private_data.mode_type === 4)
                            {
                                Send_message('send_cards', private_data.cards_to_send);
                                private_data.cards_to_send = [];
                            }
                            else if (private_data.mode_type === 1)
                                Send_message('safe_card', private_data.safe_card, private_data.host);   //wysłanie informacji o bezpiecznej karcie
                            else if (private_data.mode_type === 2)  //tylko akcja 2. wysyła tu informację o końcu rundy
                                Send_message('next_turn', null);
                        }
                        Update_windows();
                    }
                }
                break;
        }
    }
    else if (private_data.cards_to_send.length > 0) //drugi gracz ma wybór do wykonania
    {
        for (var i = 0; i < private_data.cards_to_send.length; i++)
        {
            if (private_data.cards_to_send.length === 3)
            {
                if (pos_x >= 275 + 30 * i && pos_x <= 300 + 30 * i && pos_y >= 25 && pos_y <= 50)
                {
                    private_data.gifts[private_data.cards_to_send[i]]++;    //dodanie prezentu dla gejszy
                    Update_gifts();
                    private_data.cards_to_send.splice(i, 1);
                    Send_message('send_cards', private_data.cards_to_send);
                    private_data.cards_to_send = [];
                    Update_windows();
                    break;
                }
            }
            else if (private_data.cards_to_send.length === 4)
            {
                if (pos_x >= 275 + 30 * i + Math.floor(i / 2) * 20 && pos_x <= 300 + 30 * i + Math.floor(i / 2) * 20 && pos_y >= 25 && pos_y <= 50)
                {
                    i = Math.floor(i / 2) * 2;
                    private_data.gifts[private_data.cards_to_send[i]]++;    //dodanie prezentów dla gejszy
                    private_data.gifts[private_data.cards_to_send[i + 1]]++;
                    Update_gifts();
                    private_data.cards_to_send.splice(i, 2);
                    Send_message('send_cards', private_data.cards_to_send);
                    private_data.cards_to_send = [];
                    Update_windows();
                    break;
                }
            }  
        }
    }
}

function State_to_color(state)
{
    switch (state)
    {
        case 'active': return 'rgb(0, 255, 0)';
        case 'in_use': return 'rgb(255, 255, 0)';
        case 'used': return 'rgb(150, 150, 150)';
    }
    return 'rgb(0, 0, 0)';
}
