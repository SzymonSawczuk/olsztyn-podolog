$(document).ready(function () {

    $(".zdjg").click(function () {
        var z = this;
        $(this).css({
            "position": "fixed",
            "top": "5%",
            "left": "5%",
            "width": "90%",
            "height": "90%",
            "background-size": 'contain',

        });
        $("body").css({
            "overflow-y": "hidden"

        });
        $(".bk").css({
            "display": "block"

        });
        $(".zdjg:hover").css({
            "opacity": "100%",
            "cursor": "auto"

        });
        $(".back").css({
            "display": "block"

        });
        $(".back").click(function () {
            $(z).css({
                "position": "static",
                "background-size": 'cover',
                "width": "100%",
                "height": "100%",

            });
            $(z).mouseover(function () {
                $(z).css({
                    "opacity": "80%",
                    "cursor": "pointer"
                });


            });
            $(z).mouseleave(function () {
                $(z).css({
                    "opacity": "100%",
                    "cursor": "auto"
                });


            });
            $("body").css({
                "overflow-y": "auto"

            });
            $(".bk").css({
                "display": "none"

            });

            $(".back").css({
                "display": "none"

            });
        });


    });




});