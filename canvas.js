function Draw()
{
    Draw_board();
}

function Draw_board()
{
    if (DOM.plansza.getContext) 
    {
        var ctx = DOM.plansza.getContext('2d');
        ctx.clearRect(0, 0, 800, 700);
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.lineCap = 'round';  //ustawienia pocz¹tkowe
        ctx.lineJoin = 'round';
        ctx.font = '30px arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (var i = 0; i < cards.numbers.length; i++)  //karty gejsz
        {
            ctx.fillStyle = cards.colors[i];
            ctx.fillRect(25 + i * 100, 150, 75, 150);
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillText(cards.numbers[i], 50 + i * 100, 175, 100);
        }
    }

    if (public_data.game_started)
    {
        for (var i = 0; i < cards.numbers.length; i++)  //znaczniki, kogo lubi¹ gejsze
        {
            Draw_state(ctx, [25 + i * 100, 150], private_data.likes[i]);
        }
        ctx.fillStyle = 'rgb(255, 255, 0)';
        ctx.lineWidth = 1;
        if (private_data.my_turn)
            Circle(ctx, [30, 520], 15);
        else
            Circle(ctx, [30, 40], 15);
        for (var i = 0; i < private_data.hand; i++) //karty gracza
        {
            ctx.fillStyle = cards.colors[private_data.deck[i]];
            ctx.fillRect((i + 1) * 50, 400, 25, 25);
        }
        if (!private_data.safe_cards_visible && private_data.safe_card >= 0) //karta bezpieczna
        {
            ctx.fillStyle = cards.colors[private_data.safe_card];
            ctx.fillRect(50, 550, 25, 25);
        }
        for (var i = 0; i < private_data.cards_to_send.length; i++) //karty wysy³ane
        {
            ctx.fillStyle = cards.colors[private_data.cards_to_send[i]];
            if (private_data.my_turn)
            {
                var x_shift = 0;
                var y_shift = i * 30
                if (private_data.mode_type === 4)
                {
                    x_shift = Math.floor(i / 2) * 35;
                    y_shift %= 60;
                }
                ctx.fillRect(private_data.mode_type * 50 + x_shift, 550 + y_shift, 25, 25);
            }
            else
            {
                var x_shift = 30 * i + 275;
                if (private_data.cards_to_send.length === 4)
                    x_shift += Math.floor(i / 2) * 20;
                ctx.fillRect(x_shift, 25, 25, 25);
            }
        }
        for (var i = 0; i < 4; i++) //w³asne akcje
        {
            Draw_action(ctx, i + 1, State_to_color(private_data.actions[i]), [(i + 1) * 50, 500]);
        }
        if (private_data.card_counter > 0)  //zaznaczenie ilu kart potrzeba jeszcze do akcji
        {
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillText(private_data.card_counter, private_data.mode_type * 50 + 20, 475, 50);
        }
        for (var i = 0; i < 4; i++) //akcje przeciwnika
        {
            Draw_action(ctx, i + 1, State_to_color(private_data.enemy_actions[i]), [(i + 1) * 50, 20]);
        }
        for (var i = 0; i < cards.numbers.length; i++) //w³asne prezenty
        {
            ctx.fillStyle = cards.colors[i];
            for (var j = 0; j < private_data.gifts[i]; j++)
            {
                ctx.fillRect(25 + i * 100 + (j % 3) * 30, 310 + Math.floor(j / 3) * 30, 25, 25);
                if (private_data.safe_cards_visible && j === private_data.gifts[i] - 1 && i === private_data.safe_card) //zaznaczenie bezpiecznej karty
                {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgb(0, 0, 0)';
                    ctx.moveTo(25 + i * 100 + (j % 3) * 30 + 5, 310 + Math.floor(j / 3) * 30 + 5);
                    ctx.lineTo(25 + i * 100 + (j % 3) * 30 + 15, 310 + Math.floor(j / 3) * 30 + 20);
                    ctx.lineTo(25 + i * 100 + (j % 3) * 30 + 20, 310 + Math.floor(j / 3) * 30 + 12);
                    ctx.stroke();
                }
            }
        }
        for (var i = 0; i < cards.numbers.length; i++) //prezenty przeciwnika
        {
            ctx.fillStyle = cards.colors[i];
            for (var j = 0; j < private_data.enemy_gifts[i]; j++)
            {
                ctx.fillRect(25 + i * 100 + (j % 3) * 30, 115 - Math.floor(j / 3) * 30, 25, 25);
                if (private_data.safe_cards_visible && j === private_data.enemy_gifts[i] - 1 && i === private_data.enemy_safe_card) //zaznaczenie bezpiecznej karty
                {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgb(0, 0, 0)';
                    ctx.moveTo(25 + i * 100 + (j % 3) * 30 + 5, 115 - Math.floor(j / 3) * 30 + 5);
                    ctx.lineTo(25 + i * 100 + (j % 3) * 30 + 15, 115 - Math.floor(j / 3) * 30 + 20);
                    ctx.lineTo(25 + i * 100 + (j % 3) * 30 + 20, 115 - Math.floor(j / 3) * 30 + 12);
                    ctx.stroke();
                }
            }
        }
    }
}

function Draw_action(ctx, type, color, pos)
{
    ctx.fillStyle = color;
    ctx.fillRect(pos[0], pos[1], 40, 40);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    switch (type)
    {
        case 1:
            ctx.fillRect(pos[0] + 13, pos[1] + 8, 14, 24);
            ctx.strokeRect(pos[0] + 13, pos[1] + 8, 14, 24);
            ctx.strokeStyle = 'rgb(0, 150, 0)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pos[0] + 5, pos[1] + 10);
            ctx.lineTo(pos[0] + 20, pos[1] + 30);
            ctx.lineTo(pos[0] + 32, pos[1] + 18);
            ctx.stroke();
            break;
        case 2:
            ctx.fillRect(pos[0] + 10, pos[1] + 6, 14, 24);
            ctx.strokeRect(pos[0] + 10, pos[1] + 6, 14, 24);
            ctx.fillRect(pos[0] + 16, pos[1] + 10, 14, 24);
            ctx.strokeRect(pos[0] + 16, pos[1] + 10, 14, 24);
            ctx.strokeStyle = 'rgb(150, 0, 0)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pos[0] + 5, pos[1] + 5);
            ctx.lineTo(pos[0] + 35, pos[1] + 35);
            ctx.moveTo(pos[0] + 35, pos[1] + 5);
            ctx.lineTo(pos[0] + 5, pos[1] + 35);
            ctx.stroke();
            break;
        case 3:
            ctx.strokeStyle = 'rgb(255, 150, 50)';
            ctx.fillRect(pos[0] + 13, pos[1] + 5, 14, 24);
            ctx.strokeRect(pos[0] + 13, pos[1] + 5, 14, 24);
            ctx.strokeStyle = 'rgb(0, 150, 255)';
            ctx.fillRect(pos[0] + 3, pos[1] + 12, 14, 24);
            ctx.strokeRect(pos[0] + 3, pos[1] + 12, 14, 24);
            ctx.fillRect(pos[0] + 23, pos[1] + 12, 14, 24);
            ctx.strokeRect(pos[0] + 23, pos[1] + 12, 14, 24);
            break;
        case 4:
            ctx.strokeStyle = 'rgb(255, 150, 50)';
            ctx.fillRect(pos[0] + 19, pos[1] + 2, 14, 24);
            ctx.strokeRect(pos[0] + 19, pos[1] + 2, 14, 24);
            ctx.fillRect(pos[0] + 24, pos[1] + 7, 14, 24);
            ctx.strokeRect(pos[0] + 24, pos[1] + 7, 14, 24);
            ctx.strokeStyle = 'rgb(0, 150, 255)';
            ctx.fillRect(pos[0] + 2, pos[1] + 9, 14, 24);
            ctx.strokeRect(pos[0] + 2, pos[1] + 9, 14, 24);
            ctx.fillRect(pos[0] + 7, pos[1] + 14, 14, 24);
            ctx.strokeRect(pos[0] + 7, pos[1] + 14, 14, 24);
            break;
    }
    ctx.lineWidth = 1;
}

function Draw_state(ctx, pos, state)
{
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.lineWidth = 10;
    switch (state)
    {
        case 'no_one':
            ctx.beginPath();
            ctx.moveTo(pos[0] + 25, pos[1] + 65);
            ctx.lineTo(pos[0] + 50, pos[1] + 65);
            ctx.stroke();
            ctx.moveTo(pos[0] + 25, pos[1] + 85);
            ctx.lineTo(pos[0] + 50, pos[1] + 85);
            ctx.stroke();
            break;
        case 'me':
            ctx.beginPath();
            ctx.moveTo(pos[0] + 37, pos[1] + 60);
            ctx.lineTo(pos[0] + 37, pos[1] + 90);
            ctx.lineTo(pos[0] + 27, pos[1] + 80);
            ctx.moveTo(pos[0] + 37, pos[1] + 90);
            ctx.lineTo(pos[0] + 47, pos[1] + 80);
            ctx.stroke();
            break;
        case 'enemy':
            ctx.beginPath();
            ctx.moveTo(pos[0] + 37, pos[1] + 90);
            ctx.lineTo(pos[0] + 37, pos[1] + 60);
            ctx.lineTo(pos[0] + 27, pos[1] + 70);
            ctx.moveTo(pos[0] + 37, pos[1] + 60);
            ctx.lineTo(pos[0] + 47, pos[1] + 70);
            ctx.stroke();
            break;
    }
}

function Circle(ctx, pos, radius)
{
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], radius, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.stroke();
}