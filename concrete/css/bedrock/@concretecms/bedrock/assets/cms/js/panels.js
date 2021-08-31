/* eslint-disable no-new, no-unused-vars, camelcase, eqeqeq */
/* global _, ccmi18n, Concrete, ConcreteEvent, CCM_CID, bootstrap */

var html = $('html')
var baseClasses = $('div.ccm-page').attr('class')

function ConcretePanel(options) {
    this.options = options
    this.isOpen = false
    this.detail = false
    this.isPinned = false

    this.pinned = function () {
        return this.isPinned
    }

    this.willBePinned = function () {
        return this.isOpen && !this.isPinned
    }

    this.isPinable = function () {
        return this.options.pinable
    }

    this.getPositionClass = function () {
        var ccm_class
        switch (options.position) {
        case 'left':
            ccm_class = 'ccm-panel-left'
            break
        case 'right':
            ccm_class = 'ccm-panel-right'
            break
        }

        switch (options.transition) {
        case 'slide':
            ccm_class += ' ccm-panel-transition-slide'
            break
        default:
            ccm_class += ' ccm-panel-transition-none'
            break
        }
        return ccm_class
    }

    this.getURL = function () {
        return this.options.url
    }

    this.getCurrentURL = function () {
        return this.options.currentUrl
    }

    this.getIdentifier = function () {
        return this.options.identifier
    }

    this.getDOMID = function () {
        return 'ccm-panel-' + this.options.identifier.replace('/', '-')
    }

    this.onPanelLoad = function (element) {
        var $link = $('a[data-launch-panel=' + this.getIdentifier() + ']')
        var hasTooltip = $link.hasClass('launch-tooltip')

        this.setupSubPanels()
        this.setupPanelDetails()
        jQuery.fn.dialog.hideLoader()
        if (hasTooltip) {
            $link.addClass('launch-tooltip')
        }
        var panel = this
        _.defer(function () {
            Concrete.event.publish('PanelLoad', { panel: panel, element: element })
        })
    }

    this.hide = function (callback) {
        callback = callback || $.noop
        var me = this
        var $link = $('a[data-launch-panel=' + this.getIdentifier() + ']')
        $link.toggleClass('ccm-launch-panel-active')
        this.closePanelDetail(function () {
            var obj = this
            $link.removeClass()
            $('#' + obj.getDOMID()).removeClass('ccm-panel-active')
            $('#ccm-panel-overlay').queue(function () {
                $(this).removeClass('ccm-panel-translucent')
                $(this).dequeue()
            }).delay(1000).hide(0)
            html.removeClass(obj.getPositionClass())
            html.removeClass('ccm-panel-open')
            obj.isOpen = false
            $(this).dequeue()

            callback.call(me)
            setTimeout(function () {
                Concrete.event.publish('PanelClose', { panel: obj })
            }, 0)
        })
    }

    this.toggle = function () {
        if (this.isOpen) {
            this.hide()
        } else {
            this.show()
        }
    }

    this.setupSubPanels = function () {
        var $panel = $('#' + this.getDOMID())
        var obj = this
        $panel.find('[data-launch-sub-panel-url]').unbind('.sub').on('click.sub', function () {
            $panel.addClass('ccm-panel-transitioning')
            obj.closePanelDetailImmediately()
            var url = $(this).attr('data-launch-sub-panel-url')
            $('<div />', { class: 'ccm-panel-content ccm-panel-content-appearing' }).appendTo($panel.find('.ccm-panel-content-wrapper')).load(url + '?cID=' + CCM_CID, function () {
                _.delay(function () {
                    $panel.removeClass('ccm-panel-transitioning')
                }, 250)
                $panel.find('.ccm-panel-content-visible').removeClass('ccm-panel-content-visible').addClass('ccm-panel-slide-left')
                $(this).removeClass('ccm-panel-content-appearing').addClass('ccm-panel-content-visible')

                obj.options.currentUrl = url
                obj.onPanelLoad(this)
            })
            $(this).removeClass('ccm-panel-menu-item-active')
            return false
        })
        $panel.find('[data-panel-navigation=back]').unbind().on('click.navigate', function () {
            obj.goBack()
            return false
        })
    }

    this.goBack = function (reload) {
        var $panel = $('#' + this.getDOMID())
        this.closePanelDetailImmediately()
        var my = this
        $panel
            .queue(function () {
                $panel.addClass('ccm-panel-transitioning')
                var $prev = $panel.find('.ccm-panel-content-visible').prev()
                $panel.find('.ccm-panel-content-visible').removeClass('ccm-panel-content-visible').addClass('ccm-panel-slide-right')
                $prev.removeClass('ccm-panel-slide-left').addClass('ccm-panel-content-visible')
                $panel.dequeue()
            })
            .delay(500)
            .queue(function () {
                $panel.removeClass('ccm-panel-transitioning')
                $panel.find('.ccm-panel-slide-right').remove()
                $panel.dequeue()
                if (reload) {
                    my.show()
                }
            })
    }

    this.showPanelConfirmationMessage = function (id, msg, buttons) {
        var html = '<div id="ccm-panel-confirmation-' + id + '" class="ccm-ui ccm-panel-confirmation-wrapper"><div class="ccm-panel-confirmation">'
        html += '<p>' + msg + '</p><div class="ccm-panel-confirmation-buttons"></div>'
        html += '</div></div>'
        $(html).appendTo(document.body)
        var $dialog = $('#ccm-panel-confirmation-' + id)
        $dialog.delay(0).queue(function () {
            $(this).addClass('ccm-panel-confirmation-displayed')
            $(this).dequeue()
        })

        var myButtons = [
            {
                class: 'btn pull-left btn-sm btn-link',
                type: 'button',
                'data-panel-confirmation-action': 'cancel',
                text: ccmi18n.cancel
            }
        ]
        for (var i = 0; i < buttons.length; i++) {
            myButtons.push(buttons[i])
        }
        $.each(myButtons, function (i, button) {
            $dialog.find('.ccm-panel-confirmation-buttons').append($('<button />', button))
        })
        $dialog.find('button').on('click', function () {
            $dialog.delay(0).queue(function () {
                $dialog.removeClass('ccm-panel-confirmation-displayed')
                $dialog.addClass('ccm-panel-confirmation-disappearing')
                $(this).dequeue()
            }).delay(350).queue(function () {
                $dialog.remove()
            })
        })
    }

    this.closePanelDetail = function (callback) {
        callback = callback || $.noop
        var me = this
        if (!this.detail) {
            callback.call(me)
            return false
        }

        $('a[data-launch-panel-detail=' + this.detail.identifier + ']').removeClass('ccm-panel-menu-item-active')
        var transition = this.detail.transition
        $('div.ccm-panel-detail').queue(function () {
            $(this).removeClass('ccm-panel-detail-transition-' + transition + '-apply')
            $(this).dequeue()
        }).delay(550).queue(function () {
            $(this).remove()
            $(this).dequeue()
        })

        $('div.ccm-page').queue(function () {
            $(this).removeClass('ccm-panel-detail-transition-' + transition + '-apply')
            $(this).dequeue()
        }).delay(550).queue(function () {
            html.removeClass('ccm-panel-detail-open')
            $(this).addClass('ccm-panel-detail-disable-transition')
            $(this).dequeue()
        }).delay(1).queue(function () {
            $(this).removeClass('ccm-panel-detail-transition-' + transition)
            $(this).dequeue()
        }).delay(1).queue(function () {
            $(this).removeClass('ccm-panel-detail-disable-transition')
            $(this).dequeue()

            callback.call(me)
        })

        Concrete.event.publish('PanelCloseDetail', this.detail)
        this.detail = false

        if ($('.ccm-panel-detail').length > 0) {
            return 550
        }
    }

    this.closePanelDetailImmediately = function () {
        if (!this.detail) {
            return false
        }
        html.removeClass('ccm-panel-detail-open')
        $('.ccm-panel-detail').remove()
        $('.ccm-page').removeClass().addClass(baseClasses)
        Concrete.event.publish('PanelCloseDetail', this.detail)
        this.detail = false
    }

    this.openPanelDetail = function (overrides) {
        var obj = this
        var options = $.extend({
            transition: 'none',
            url: false,
            data: ''
        }, overrides)
        var identifier = options.identifier
        // if a panel is already open, we close it immediately
        if (obj.detail) {
            obj.closePanelDetailImmediately()
        }
        obj.detail = options

        var detailID = 'ccm-panel-detail-' + identifier

        var $detail = $('<div />', {
            id: detailID,
            class: 'ccm-panel-detail'
        }).appendTo(document.body)

        var $content = $('<div />', {
            class: 'ccm-ui ccm-panel-detail-content'
        }).appendTo($detail)

        $('div.ccm-page')
            .queue(function () {
                $detail.addClass('ccm-panel-detail-transition-' + options.transition)
                $(this).addClass('ccm-panel-detail-transition-' + options.transition)
                $(this).dequeue()
            })
            .delay(3)
            .queue(function () {
                $detail.addClass('ccm-panel-detail-transition-' + options.transition + '-apply')
                $(this).addClass('ccm-panel-detail-transition-' + options.transition + '-apply')
                $(this).dequeue()
            })
        html.addClass('ccm-panel-detail-open')

        var complete_function = function () {
            Concrete.event.publish('PanelOpenDetail', {
                panel: options,
                panelObj: obj,
                container: $content
            })
        }

        if (options.url) {
            var url = options.url + '?cID=' + CCM_CID
            var data = null
            if ($.isPlainObject(options.data)) {
                data = options.data
            } else {
                url += options.data
            }
            $content.load(url, data, function () {
                $.fn.dialog.hideLoader()
                const tooltipTriggerList = [].slice.call($content.find('.launch-tooltip'))
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl, { container: '#ccm-tooltip-holder' })
                })
                obj.loadPanelDetailActions($content)

                _.defer(complete_function)
            })
        } else {
            $.fn.dialog.hideLoader()
            const tooltipTriggerList = [].slice.call($content.find('.launch-tooltip'))
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl, { container: '#ccm-tooltip-holder' })
            })
            obj.loadPanelDetailActions($content)

            _.defer(complete_function)
        }
    }

    this.loadPanelDetailActions = function ($content) {
        var obj = this
        $('button[data-panel-detail-action=cancel]').on('click', function () {
            obj.closePanelDetail()
        })

        $content.find('[data-panel-detail-form]').concreteAjaxForm()

        $('button[data-panel-detail-action=submit]').on('click', function () {
            $('[data-panel-detail-form]').submit()
        })

        ConcreteEvent.subscribe('AjaxFormSubmitSuccess', function (e, data) {
            if ($('[data-panel-detail-form="' + data.form + '"]').data('action-after-save') == 'reload') {
                window.location.reload()
            }
        })
    }

    this.getPostParams = function () {
        var areaHandles = []

        $('.ccm-area').each(function() {
            areaHandles.push($(this).data('areaHandle'))
        })

        return {
            usedAreas: areaHandles
        }
    }

    this.setupPanelDetails = function () {
        var $panel = $('#' + this.getDOMID())
        var obj = this
        const tooltipTriggerList = [].slice.call($panel.find('.launch-tooltip'))
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, { container: '#ccm-tooltip-holder' })
        })
        $panel.find('[data-panel-menu=accordion]').each(function () {
            var $accordion = $(this)
            var $title = $(this).find('>nav>span')
            $title.text($(this).find('a[data-panel-accordion-tab-selected=true]').text())
            $title.unbind('.accordion').on('click.accordion', function () {
                $accordion.toggleClass('ccm-panel-header-accordion-dropdown-visible')
            })
            $(this).find('>nav ul a').unbind('.accordion').on('click.accordion', function () {
                var url = obj.getCurrentURL()
                if (!url) {
                    url = obj.getURL()
                }
                var $content = $panel.find('.ccm-panel-content')
                $accordion.removeClass('ccm-panel-header-accordion-dropdown-visible')
                $title.html($(this).text())
                $.fn.dialog.showLoader()
                $content.load(url + '?cID=' + CCM_CID + '&tab=' + $(this).attr('data-panel-accordion-tab'), function () {
                    $.fn.dialog.hideLoader()
                    obj.onPanelLoad(this)
                })
            })
        })

        $panel.find('[data-panel-menu=dropdown]').each(function () {
            var $dropdown = $(this)
            var $title = $dropdown.find('[data-panel-header=dropdown-menu]')
            $(this).find('[data-panel-dropdown-tab]').unbind('.dropdown-tab').on('click.dropdown-tab', function (e) {
                e.preventDefault()
                var url = obj.getCurrentURL()
                if (!url) {
                    url = obj.getURL()
                }
                var $content = $panel.find('.ccm-panel-content')
                $.fn.dialog.showLoader()

                $.ajax({
                    url: url + '?cID=' + CCM_CID + '&tab=' + $(this).attr('data-panel-dropdown-tab'),
                    type: 'POST',
                    data: obj.getPostParams(),
                    success: function (html) {
                        $content.html(html)
                        $title.html($($content.get(0)).text())
                        $.fn.dialog.hideLoader()
                        obj.onPanelLoad($content.get(0))
                    }
                })
            })
        })

        $panel.find('.dialog-launch').dialog()
        $panel.find('[data-launch-panel-detail]').unbind('.detail').on('click.detail', function () {
            $.fn.dialog.showLoader()
            $('.ccm-panel-menu-item-active').removeClass('ccm-panel-menu-item-active')
            $(this).addClass('ccm-panel-menu-item-active')
            var identifier = $(this).attr('data-launch-panel-detail')
            var panelDetailOptions = { identifier: identifier, target: $(this) }
            if ($(this).attr('data-panel-transition')) {
                panelDetailOptions.transition = $(this).attr('data-panel-transition')
            }
            if ($(this).attr('data-panel-detail-url')) {
                panelDetailOptions.url = $(this).data('panel-detail-url')
            }
            obj.openPanelDetail(panelDetailOptions)
            return false
        })
        obj.loadPanelDetailActions($panel)
    }

    this.show = function (callback) {
        callback = callback || $.noop
        var $link = $('a[data-launch-panel=' + this.getIdentifier() + ']')
        jQuery.fn.dialog.showLoader()
        $link.toggleClass('ccm-launch-panel-active')
        var element = $('#' + this.getDOMID())
        var obj = this
        var show = function () {
            element.off('click.ccm-panel-close').on('click.ccm-panel-close', '.ccm-panel-close a, .ccm-panel-close button', function (e) {
                e.preventDefault()
                obj.hide()
            })
            html.addClass('ccm-panel-open')
            element.find('.ccm-panel-content-wrapper').html('')
            element.addClass('ccm-panel-active ccm-panel-loading')
            var $div = $('<div/>').addClass('ccm-panel-content ccm-panel-content-visible')
                .appendTo(element.find('.ccm-panel-content-wrapper'))

            $.ajax({
                url: obj.getURL() + '?cID=' + CCM_CID,
                type: 'POST',
                data: obj.getPostParams(),
                success: function(html) {
                    $div.html(html)
                    element.delay(1).queue(function () {
                        $(this).removeClass('ccm-panel-loading').addClass('ccm-panel-loaded')
                        $(this).dequeue()
                    })
                    obj.onPanelLoad(element)
                    obj.isOpen = true
                    Concrete.event.publish('PanelOpen', {
                        panel: obj,
                        element: $div.get(0)
                    })
                }
            })
            if (obj.options.overlay) {
                ConcretePanelManager.showOverlay(obj.options.translucent)
            }
            html.addClass(obj.getPositionClass())
        }

        if (this.options.primary) {
            var open_panel = _(ConcretePanelManager.getPanels()).findWhere({
                isOpen: true
            })
            if (open_panel) {
                open_panel.hide(function () {
                    show.call(this)
                })
            } else {
                show.call(this)
            }
        } else {
            show.call(this)
        }

        // hide mobile menu
        $('.ccm-toolbar-mobile-menu-button').removeClass('ccm-mobile-close')
        $('.ccm-mobile-menu-overlay').slideUp()
    }
}

var ConcretePanelManager = (function () {
    var panels = []

    return {

        getPanels: function () {
            return panels
        },

        showOverlay: function (translucent) {
            $('#ccm-panel-overlay')
                .clearQueue()
                .show(0)
                .delay(100)
                .queue(function () {
                    if (translucent) {
                        $(this).addClass('ccm-panel-translucent')
                    } else {
                        $(this).removeClass('ccm-panel-translucent')
                    }
                    $(this).dequeue()
                })
        },

        /**
         * Hides all panels, exit preview mode, hides detail content if active, etc..
         */
        exitPanelMode: function (callback) {
            callback = callback || $.noop
            var active = 0

            function loopFunction() {
                active--
                if (active == 0) {
                    callback(null)
                }
            }

            for (var i = 0; i < panels.length; i++) {
                if (panels[i].isOpen) {
                    active++
                    panels[i].hide(loopFunction)
                }
            }
        },

        register: function (overrides) {
            var options = $.extend({
                translucent: true,
                overlay: true,
                position: 'left',
                primary: true,
                transition: 'slide'
            }, overrides)

            var panel = new ConcretePanel(options)
            panels.push(panel)

            var $panel = $('#' + panel.getDOMID())
            if (!($panel.length)) {
                $('<div />', {
                    id: panel.getDOMID(),
                    class: 'ccm-panel ' + panel.getPositionClass()
                }).appendTo($(document.body))

                $('<div />', {
                    class: 'ccm-panel-content-wrapper ccm-ui'
                }).appendTo($('#' + panel.getDOMID()))
            }
        },

        getByIdentifier: function (panelID) {
            for (var i = 0; i < panels.length; i++) {
                if (panels[i].getIdentifier() == panelID) {
                    return panels[i]
                }
            }
        }

    }
}())

global.ConcretePanel = ConcretePanel
global.ConcretePanelManager = ConcretePanelManager
