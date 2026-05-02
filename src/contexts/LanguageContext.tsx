import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import React, { createContext, Dispatch, ReactNode, useContext, useEffect, useState } from 'react';
import { selectedLang } from '../components/constants';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav: {
            home: 'Home',
            menu: 'Menu',
            cart: 'Your cart',
            orders: 'Orders',
            settings: 'Settings',
            statistics: 'Statistics',
            signOut: 'Sign out',
          },

          product: {
            type: 'Product type',
            settings: 'Product settings',
            label: 'Product',
            soldOut: 'Sold out',
            sizes: 'Sizes',
            price: 'Price',
            currency: 'MAD',
            preview: 'Product preview',
            info: 'Product info',
            details: 'Product details',
            reviews: 'Product reviews',
            loading: 'Products are loading...',
            noneYet: 'New products will come!',
            stayTuned: 'Stay tuned!',
            view: 'View the product',
            addToCart: 'Add to cart',
            size: 'Size',
            category: 'Category',
            ref: 'Ref',
            name: 'Name',
            before: 'Before',
            promotion: 'Discount',
            off: 'Off',
            readMore: 'Read more',
            readLess: 'Read less',
            quantity: 'Quantity',
            availability: 'Availability',
          },

          productTypes: {
            shoe: 'Shoes',
            sandal: 'Sandals',
            shirt: 'Shirts',
            pant: 'Pants',
          },

          cart: {
            title: 'Your cart',
            empty: 'There are no items in your shopping cart',
            clear: 'Clear cart',
            toCart: 'To cart',
            addSuccess: 'A new item is added!',
            sizeNotSelected: 'Size is not selected!',
            quantityAction: 'Quantity/Action',
            total: 'Total',
            cleared: 'The cart is cleared',
            itemRemoved: 'The item is removed',
            shopNow: 'Shop now',
          },

          order: {
            summary: 'ORDER SUMMARY',
            shipping: 'Shipping',
            other: 'Other',
            totalAmount: 'Total amount',
            yourOrder: 'Your order',
            orderId: 'Order ID',
            checkoutNow: 'Checkout now!',
            details: 'Order details',
          },

          confirm: {
            removeItem: 'Are you sure you want to remove this item?',
            removeAll: 'Are you sure you want to remove all the items?',
            deleteTitle: 'Delete confirmation',
            clearAllItems: 'Clear all items',
            remove: 'Remove',
            cancelBack: 'Cancel and Back',
            delete: 'Delete',
          },

          delivery: {
            label: 'Delivery',
            free: 'Free',
            time: 'Delivery time',
            expected: 'expected',
            from: 'from',
            to: 'to',
            cityOnly: 'Currently, delivery is only available in the city of Laayoune.',
          },

          payment: {
            portal: 'Payment portal',
            creditCard: 'Credit card',
            cod: 'Cash on delivery COD',
            choose: 'Please choose a payment method!',
            chosen: 'Chosen payment method',
            notChosen: 'Not chosen yet!',
            methods: 'Payments',
            pay: 'Pay',
            checkoutAlert: 'Fill the form firstly, then choose the payment method 👍🏻',
            // ── Checkout overlay stages ────────────────────────────────────
            overlayUrlTitle:      'Initializing Payment',
            overlayUrlSub:        'Setting up your secure session…',
            overlayCodTitle:      'Placing Your Order',
            overlayCodSub:        'Confirming your order…',
            overlayRedirectTitle: 'Redirecting to Payment',
            overlayRedirectSub:   'Taking you to the payment page…',
          },

          transaction: {
            info: 'Transaction infos',
            code: 'Code',
            currency: 'Currency',
            amount: 'Amount',
            transactionId: 'Transaction ID',
            success: 'Your transaction is successfully completed',
            downloadTicket: 'Download e-command ticket',
            thank: 'Thank you for your confidence',

            // ── PaymentCallback progress labels ────────────────────────────
            verifying:            'Verifying Payment',
            verifyingSub:         'Confirming with payment gateway…',
            processing:           'Processing Order',
            processingSub:        'Recording your order…',
            emailing:             'Sending Invoice',
            emailingSub:          'Emailing your receipt…',
            done:                 'All Done!',
            doneSub:              'Redirecting you now…',
            pleaseWait:           'Please wait…',
            attemptOf:            'Attempt {{current}} of {{max}}',
            waitingBeforeRetry:   'Waiting before retry {{current}} of {{max}}…',

            // ── PaymentCallback retry screen ───────────────────────────────
            retryTitle:           'Payment could not be confirmed',
            retryDefaultReason:   'Your payment could not be verified. Please try again.',
            retryLabel:           'Transaction',
            retryOrder:           'Order',
            retryBtn:             'Try Again',
            cancelBtn:            'Cancel order',
            retryNote:            'Your reserved items are still held. Retrying will take you back to the payment page without creating a new order.',
            retryBusy:            'Please wait…',

            // ── PaymentCallback error screen ───────────────────────────────
            errorTitle:           'Something went wrong',
            errorNote:            'Please contact our support team with the details above.',

            // ── TransactionFailed — base ───────────────────────────────────
            failedTitle:          'Payment Failed',
            failedDefaultMsg:     'Something went wrong with your payment.',
            failedOrderId:        'Order ID',
            failedTransactionId:  'Transaction ID',
            failedErrorCode:      'Error Code',
            failedSupportNote:    'Please keep your transaction ID and contact support if you were charged.',
            failedGoHome:         'Go Home',
            failedTryAgain:       'Try Again',

            // ── TransactionFailed — category badges ────────────────────────
            failedCategory_cancelled:          'Payment Cancelled',
            failedCategory_insufficient_funds: 'Insufficient Funds',
            failedCategory_card_declined:      'Card Declined',
            failedCategory_card_expired:       'Card Expired',
            failedCategory_auth_failed:        '3-D Secure Failed',
            failedCategory_timeout:            'Session Timed Out',
            failedCategory_generic:            'Payment Failed',

            // ── TransactionFailed — contextual hints ───────────────────────
            failedHintCancelled:  'You cancelled the payment. Your reserved items are still held — click "Try Again" to return to the payment page.',
            failedHintFunds:      'Your card was declined due to insufficient funds. Please use a different card or top up your account and try again.',
            failedHintDeclined:   'Your card was declined by the bank. Please check your card details or contact your bank before trying again.',
            failedHintExpired:    'Your card appears to be expired. Please update your card information and try with a valid card.',
            failedHintAuth:       '3-D Secure authentication failed. Please try again and follow the verification steps sent by your bank.',
            failedHintTimeout:    'The payment session timed out. This can happen if the page was left open too long. Please try again.',
          },

          form: {
            firstName: {
              label: 'First name',
              required: 'Your first name is required',
            },
            lastName: {
              label: 'Last name',
              required: 'Your last name is required',
            },
            fullName: 'Full name',
            email: {
              label: 'E-mail',
              required: 'Your e-mail is required',
            },
            address: {
              label: 'Address',
              required: 'Your address is required',
            },
            city: {
              label: 'City',
              required: 'Your city is required',
            },
            save: 'Save',
            saveChanges: 'Save modifications',
            modify: 'Modify',
            submit: 'Submit',
            clientInfo: 'Client informations',
            selectCity: 'Select your city',
            phone: {
              label: 'Phone number',
              required: 'Your phone number is required',
              minLength: 'Minimum 10 characters',
              invalidFormat: 'Enter a valid phone number: 06.., 07.. or +212..',
            },
          },

          review: {
            title: 'Product reviews',
            add: 'Add your review',
            submit: 'Add the review',
            stars: 'Stars',
            username: 'Username',
            yourReview: 'Your review',
            firstReview: 'Put the first review!',
          },

          pagination: {
            next: 'Next',
            previous: 'Previous',
          },

          ui: {
            loading: 'Loading . . .',
            back: 'Back',
            search: 'Search',
            reset: 'Reset',
            enterName: 'Enter a name',
            enterRef: 'Enter a ref',
            save: 'Save',
          },

          home: {
            promotions: 'Our offers and promotions',
            products: 'Our products',
            goToShoes: 'Go to shoes section',
            goToSandals: 'Go to sandals section',
            goToShirts: 'Go to shirts section',
            goToPants: 'Go to pants section',
            moreShoes: 'More shoes',
            moreSandals: 'More sandals',
            moreShirts: 'More shirts',
            morePants: 'More pants',
          },

          admin: {
            orders: {
              remaining: 'Remaining orders',
              delivered: 'Delivered orders',
              all: 'All orders',
              notConfirmed: 'Orders not confirmed',
              showAll: 'Show all orders',
              noRemaining: 'No remaining order found',
              noDelivered: 'No order delivered yet',
              noOrders: 'No order yet',
              treated: 'The order is treated successfully',
              alreadyTreated: 'The order is already treated',
              process: 'Process',
              waiting: 'Waiting',
              done: 'Done',
              treated_label: 'Treated',
              status: 'Status',
              date: 'Date',
              action: 'Action',
              extractDeliveryForm: 'Extract delivery form',
              extractSuccess: 'Delivery form was extracted successfully',
            },
            deficiency: {
              title: 'Quantity\'s deficiency',
              current: 'Current deficiencies',
              showAll: 'Show all deficiencies',
              process: 'Process',
              message: 'Please process the deficiencies, then process the order!',
              confirm: 'Confirmation of deficiency treatment',
              success: 'The deficiency was treated successfully',
              noFound: 'No deficiency found',
              quantityRequested: 'Quantity requested',
            },
            product: {
              select: 'Select a product',
              mainImage: 'Main image',
              additionalImages: 'Additional Images',
              newer: 'Newer product',
              uploadedImages: 'Uploaded images',
              delete: 'Delete a product',
              modify: 'Modify a product',
              addData: 'Add product data',
              add: 'Add a product',
              advancedSearch: 'Advanced search',
              management: 'Management of products',
              managementOf: 'Products management of',
              noChosen: 'No product chosen',
              noData: 'This product does not contain any data',
              orderedProducts: 'Ordered products',
              noCategoryData: 'No category data',
              categoryError: 'Add a category to the product in the settings first, then add one',
              addTypes: 'Add product types',
              addCategories: 'Add product categories',
              selectType: 'Select product type',
              selectCategory: 'Select a category',
            },
            overview: {
              general: 'General overview',
              notDeveloped: 'Not developed yet',
            },
            users: {
              manager: 'Users Manager',
              add: 'Add a user',
              username: 'Username',
              password: 'Password',
              confirmPassword: 'Confirm password',
              passwordMismatch: 'Passwords do not match',
              role: 'Role',
              selectRole: 'Select user role',
              manager_role: 'Manager',
              admin_role: 'Admin',
              deliveryMan: 'Delivery man',
              registrationSuccess: 'Registration is succeeded',
            },
          },

          tracking: {
            title: 'Order state tracker',
            searching: 'Searching the order',
            notValidated: 'Your order is on the way to be validated',
            validated: 'Your order is validated and it is on the way to you',
            attempts: 'Searching attempts',
            limitReached: 'You have reached the search attempt limit. You can try again tomorrow.',
            noValidId: 'is not a valid order ID',
            noOrderFound: 'There is no order associated with the order ID provided',
            idProvided: 'Order ID provided',
          },

          auth: {
            welcomeBack: 'Welcome back!',
            signOut: 'Sign out',
          },

          footer: {
            followUs: 'Follow us',
            contactUs: 'Contact us',
            policies: 'Policies',
            privacyPolicy: 'Privacy policy',
            usePolicy: 'General conditions of use',
            policiesNotAccepted: 'Please accept the terms and privacy policy.',
          },

          error: {
            elementNotFound: 'The element is not found!',
            pageNotFound: 'Oops! This page does not exist.',
          },
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // FRENCH
      // ══════════════════════════════════════════════════════════════════════
      fr: {
        translation: {
          nav: {
            home: 'Accueil',
            menu: 'Menu',
            cart: 'Votre panier',
            orders: 'Ordres',
            settings: 'Paramètres',
            statistics: 'Statistiques',
            signOut: 'Déconnexion',
          },

          product: {
            type: 'Type de produit',
            settings: 'Paramètres du produit',
            label: 'Produit',
            soldOut: 'Épuisé',
            sizes: 'Tailles',
            price: 'Prix',
            currency: 'MAD',
            preview: 'Aperçu du produit',
            info: 'Infos du produit',
            details: 'Détails du produit',
            reviews: 'Avis sur les produits',
            loading: 'Chargement des produits...',
            noneYet: 'De nouveaux produits arriveront !',
            stayTuned: 'Restez à l\'écoute !',
            view: 'Voir le produit',
            addToCart: 'Ajouter au panier',
            size: 'Taille',
            category: 'Catégorie',
            ref: 'Ref',
            name: 'Nom',
            before: 'Avant',
            promotion: 'Promotion',
            off: 'Moins',
            readMore: 'Lire plus',
            readLess: 'Lire moins',
            quantity: 'Quantité',
            availability: 'Disponibilité',
          },

          productTypes: {
            shoe: 'Shoes',
            sandal: 'Sandales',
            shirt: 'Shirts',
            pant: 'Pants',
          },

          cart: {
            title: 'Votre panier',
            empty: 'Il n\'y a aucun article dans votre panier',
            clear: 'Vider le panier',
            toCart: 'Retour au panier',
            addSuccess: 'Un nouvel article est ajouté !',
            sizeNotSelected: 'La taille n\'est pas choisie !',
            quantityAction: 'Quantité/Action',
            total: 'Total',
            cleared: 'Le panier est vidé',
            itemRemoved: 'L\'élément est supprimé',
            shopNow: 'Achetez maintenant',
          },

          order: {
            summary: 'La commande',
            shipping: 'Transport',
            other: 'Autre',
            totalAmount: 'Montant',
            yourOrder: 'Votre commande',
            orderId: 'ID commande',
            checkoutNow: 'Checkout maintenant !',
            details: 'Détails de la commande',
          },

          confirm: {
            removeItem: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
            removeAll: 'Êtes-vous sûr de vouloir supprimer tous les éléments ?',
            deleteTitle: 'Confirmation de suppression',
            clearAllItems: 'Effacer tous',
            remove: 'Supprimer',
            cancelBack: 'Annuler et revenir',
            delete: 'Supprimer',
          },

          delivery: {
            label: 'Livraison',
            free: 'Gratuit',
            time: 'Délai de livraison',
            expected: 'attendu',
            from: 'de',
            to: 'à',
            cityOnly: 'Actuellement, la livraison est disponible uniquement à la ville de Laâyoune.',
          },

          payment: {
            portal: 'Portail de paiement',
            creditCard: 'Carte bancaire',
            cod: 'Cash on delivery COD',
            choose: 'Merci de choisir une méthode de paiement !',
            chosen: 'Méthode de paiement choisie',
            notChosen: 'Pas encore choisi !',
            methods: 'Paiements',
            pay: 'Payer',
            checkoutAlert: 'Remplissez d\'abord le formulaire, puis choisissez le mode de paiement 👍🏻',
            // ── Checkout overlay stages ────────────────────────────────────
            overlayUrlTitle:      'Initialisation du paiement',
            overlayUrlSub:        'Configuration de votre session sécurisée…',
            overlayCodTitle:      'Passage de votre commande',
            overlayCodSub:        'Confirmation de votre commande…',
            overlayRedirectTitle: 'Redirection vers le paiement',
            overlayRedirectSub:   'Vous allez être redirigé vers la page de paiement…',
          },

          transaction: {
            info: 'Infos de transaction',
            code: 'Code',
            currency: 'Devise',
            amount: 'Montant',
            transactionId: 'ID transaction',
            success: 'Votre transaction est effectuée avec succès',
            downloadTicket: 'Télécharger le ticket de l\'e-commande',
            thank: 'Merci pour votre confiance !',

            // ── PaymentCallback progress labels ────────────────────────────
            verifying:            'Vérification du paiement',
            verifyingSub:         'Confirmation avec la passerelle de paiement…',
            processing:           'Traitement de la commande',
            processingSub:        'Enregistrement de votre commande…',
            emailing:             'Envoi de la facture',
            emailingSub:          'Votre reçu est en cours d\'envoi…',
            done:                 'Tout est fait !',
            doneSub:              'Redirection en cours…',
            pleaseWait:           'Veuillez patienter…',
            attemptOf:            'Tentative {{current}} sur {{max}}',
            waitingBeforeRetry:   'Attente avant la tentative {{current}} sur {{max}}…',

            // ── PaymentCallback retry screen ───────────────────────────────
            retryTitle:           'Le paiement n\'a pas pu être confirmé',
            retryDefaultReason:   'Votre paiement n\'a pas pu être vérifié. Veuillez réessayer.',
            retryLabel:           'Transaction',
            retryOrder:           'Commande',
            retryBtn:             'Réessayer',
            cancelBtn:            'Annuler la commande',
            retryNote:            'Vos articles sont toujours réservés. Réessayer vous ramènera à la page de paiement sans créer une nouvelle commande.',
            retryBusy:            'Veuillez patienter…',

            // ── PaymentCallback error screen ───────────────────────────────
            errorTitle:           'Une erreur s\'est produite',
            errorNote:            'Veuillez contacter notre service d\'assistance avec les détails ci-dessus.',

            // ── TransactionFailed — base ───────────────────────────────────
            failedTitle:          'Paiement échoué',
            failedDefaultMsg:     'Une erreur s\'est produite lors de votre paiement.',
            failedOrderId:        'ID commande',
            failedTransactionId:  'ID transaction',
            failedErrorCode:      'Code d\'erreur',
            failedSupportNote:    'Veuillez conserver votre ID de transaction et contacter le support si vous avez été débité.',
            failedGoHome:         'Accueil',
            failedTryAgain:       'Réessayer',

            // ── TransactionFailed — category badges ────────────────────────
            failedCategory_cancelled:          'Paiement annulé',
            failedCategory_insufficient_funds: 'Fonds insuffisants',
            failedCategory_card_declined:      'Carte refusée',
            failedCategory_card_expired:       'Carte expirée',
            failedCategory_auth_failed:        'Échec 3-D Secure',
            failedCategory_timeout:            'Session expirée',
            failedCategory_generic:            'Paiement échoué',

            // ── TransactionFailed — contextual hints ───────────────────────
            failedHintCancelled:  'Vous avez annulé le paiement. Vos articles sont toujours réservés — cliquez sur « Réessayer » pour revenir à la page de paiement.',
            failedHintFunds:      'Votre carte a été refusée en raison de fonds insuffisants. Veuillez utiliser une autre carte ou recharger votre compte et réessayer.',
            failedHintDeclined:   'Votre carte a été refusée par la banque. Vérifiez vos coordonnées ou contactez votre banque avant de réessayer.',
            failedHintExpired:    'Votre carte semble expirée. Veuillez mettre à jour vos informations bancaires et réessayer avec une carte valide.',
            failedHintAuth:       'L\'authentification 3-D Secure a échoué. Veuillez réessayer et suivre les étapes de vérification envoyées par votre banque.',
            failedHintTimeout:    'La session de paiement a expiré. Cela peut arriver si la page est restée ouverte trop longtemps. Veuillez réessayer.',
          },

          form: {
            firstName: {
              label: 'Prénom',
              required: 'Votre prénom est obligatoire',
            },
            lastName: {
              label: 'Nom',
              required: 'Votre nom est obligatoire',
            },
            fullName: 'Nom et prénom',
            email: {
              label: 'E-mail',
              required: 'Votre e-mail est obligatoire',
            },
            phone: {
              label: 'N° de téléphone',
              required: 'Votre N° téléphone est obligatoire',
              minLength: 'Minimum 10 caractères',
              invalidFormat: 'Entrez un numéro valide : 06.., 07.. ou +212..',
            },
            address: {
              label: 'Adresse',
              required: 'Votre adresse est obligatoire',
            },
            city: {
              label: 'Ville',
              required: 'Votre ville est obligatoire',
            },
            save: 'Sauvegarder',
            saveChanges: 'Sauvegarder les modifications',
            modify: 'Modifier',
            submit: 'Soumettre',
            clientInfo: 'Informations du client',
            selectCity: 'Sélectionnez votre ville',
          },

          review: {
            title: 'Avis sur les produits',
            add: 'Ajouter votre avis',
            submit: 'Ajouter l\'avis',
            stars: 'Étoiles',
            username: 'Nom d\'utilisateur',
            yourReview: 'Votre avis',
            firstReview: 'Publier le premier avis !',
          },

          pagination: {
            next: 'Suivant',
            previous: 'Précédent',
          },

          ui: {
            loading: 'Chargement . . .',
            back: 'Retour',
            search: 'Recherche',
            reset: 'Réinitialiser',
            enterName: 'Saisir un nom',
            enterRef: 'Saisir une référence',
            save: 'Sauvegarder',
          },

          home: {
            promotions: 'Nos offres et promotions',
            products: 'Nos produits',
            goToShoes: 'Aller à la section des chaussures',
            goToSandals: 'Aller à la section des sandales',
            goToShirts: 'Aller à la section des chemises',
            goToPants: 'Aller à la section des pantalons',
            moreShoes: 'Plus de chaussures',
            moreSandals: 'Plus de sandales',
            moreShirts: 'Plus de shirts',
            morePants: 'Plus de pants',
          },

          admin: {
            orders: {
              remaining: 'Commandes en attente',
              delivered: 'Commandes livrées',
              all: 'Toutes les commandes',
              notConfirmed: 'Commandes non confirmées',
              showAll: 'Afficher toutes les commandes',
              noRemaining: 'Aucune commande en attente pour le moment',
              noDelivered: 'Aucune commande livrée pour le moment',
              noOrders: 'Aucune commande pour le moment',
              treated: 'La commande a été traitée avec succès',
              alreadyTreated: 'La commande a déjà été traitée',
              process: 'Traiter',
              waiting: 'En attente',
              done: 'Faite',
              treated_label: 'Traitée',
              status: 'État',
              date: 'Date',
              action: 'Action',
              extractDeliveryForm: 'Extraire le formulaire de livraison',
              extractSuccess: 'Le formulaire de livraison a été extrait avec succès',
            },
            deficiency: {
              title: 'Déficit de quantité',
              current: 'Déficiences actuelles',
              showAll: 'Afficher toutes les déficiences',
              process: 'Traiter',
              message: 'Veuillez traiter les déficiences, puis traiter la commande !',
              confirm: 'Confirmer le traitement de la déficience',
              success: 'La déficience a été traitée avec succès',
              noFound: 'Aucune déficience trouvée',
              quantityRequested: 'Quantité demandée',
            },
            product: {
              select: 'Choisissez un produit',
              mainImage: 'Image principale',
              additionalImages: 'Images supplémentaires',
              newer: 'Produit plus récent',
              uploadedImages: 'Images téléchargées',
              delete: 'Supprimer un produit',
              modify: 'Modifier un produit',
              addData: 'Ajouter les données du produit',
              add: 'Ajouter un produit',
              advancedSearch: 'Recherche avancée',
              management: 'Gestion des produits',
              managementOf: 'Gestion des produits de',
              noChosen: 'Pas de produit choisi',
              noData: 'Ce produit ne contient pas de données',
              orderedProducts: 'Produits commandés',
              noCategoryData: 'Pas de données de catégorie',
              categoryError: 'Ajoutez d\'abord une catégorie au produit dans les paramètres, puis ajoutez-en une',
              addTypes: 'Ajouter des types de produits',
              addCategories: 'Ajouter des catégories de produits',
              selectType: 'Sélectionnez le type de produit',
              selectCategory: 'Choisissez une catégorie',
            },
            overview: {
              general: 'Aperçu général',
              notDeveloped: 'Pas encore développé',
            },
            users: {
              manager: 'Gestion d\'utilisateurs',
              add: 'Ajouter un utilisateur',
              username: 'Nom d\'utilisateur',
              password: 'Mot de passe',
              confirmPassword: 'Confirmer le mot de passe',
              passwordMismatch: 'Les mots de passe ne correspondent pas',
              role: 'Rôle',
              selectRole: 'Choisissez un rôle',
              manager_role: 'Manager',
              admin_role: 'Admin',
              deliveryMan: 'Livreur',
              registrationSuccess: 'L\'inscription a réussi',
            },
          },

          tracking: {
            title: 'Suivi de l\'état des commandes',
            searching: 'Recherche de la commande',
            notValidated: 'Votre commande est en cours de validation',
            validated: 'Votre commande est validée et elle est en route vers vous',
            attempts: 'Tentatives de recherche',
            limitReached: 'Vous avez atteint la limite de tentatives de recherche. Vous pourrez réessayer demain.',
            noValidId: 'n\'est pas un ID de commande valide',
            noOrderFound: 'Aucune commande n\'est associée à l\'ID de commande fourni',
            idProvided: 'ID de commande fourni',
          },

          auth: {
            welcomeBack: 'Content de te revoir !',
            signOut: 'Déconnexion',
          },

          footer: {
            followUs: 'Suivez-nous',
            contactUs: 'Contactez-nous',
            policies: 'Politiques',
            privacyPolicy: 'Politique de confidentialité',
            usePolicy: 'Conditions générales d\'utilisation',
            policiesNotAccepted: 'Veuillez accepter les conditions d\'utilisation et la politique de confidentialité.',
          },

          error: {
            elementNotFound: 'L\'élément n\'est pas trouvé !',
            pageNotFound: 'Oups ! Cette page n\'existe pas.',
          },
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // ARABIC
      // ══════════════════════════════════════════════════════════════════════
      ar: {
        translation: {
          nav: {
            home: 'الرئيسية',
            menu: 'القائمة',
            cart: 'السلة',
            orders: 'الطلبيات',
            settings: 'الإعدادات',
            statistics: 'الإحصائيات',
            signOut: 'تسجيل الخروج',
          },

          product: {
            type: 'نوع المنتج',
            settings: 'إعدادات المنتج',
            label: 'المنتج',
            soldOut: 'نفذ',
            sizes: 'المقاسات',
            price: 'السعر',
            currency: 'د.م',
            preview: 'معاينة المنتج',
            info: 'تفاصيل المنتج',
            details: 'تفاصيل المنتج',
            reviews: 'مراجعات المنتج',
            loading: 'جاري تحميل المنتجات...',
            noneYet: 'منتجات جديدة قادمة !',
            stayTuned: 'ترقبوا !',
            view: 'معاينة المنتج',
            addToCart: 'اضافة الى السلة',
            size: 'المقاس',
            category: 'الصنف',
            ref: 'المرجع',
            name: 'الاسم',
            before: 'قبل',
            promotion: 'عرض خاص',
            off: 'تخفيض',
            readMore: 'رؤية الكل',
            readLess: 'رؤية أقل',
            quantity: 'الكمية',
            availability: 'التوفر',
          },

          productTypes: {
            shoe: 'الأحذية',
            sandal: 'صنادل',
            shirt: 'أقمصة',
            pant: 'سراويل',
          },

          cart: {
            title: 'السلة',
            empty: 'لا يوجد أي سلع في سلة التسوق الخاصة بك',
            clear: 'إفراغ السلة',
            toCart: 'الرجوع الى السلة',
            addSuccess: 'تمت إضافة عنصر جديد الى السلة !',
            sizeNotSelected: 'لم يتم اختيار مقاس محدد !',
            quantityAction: 'الكمية/إجراء',
            total: 'المجموع',
            cleared: 'تم تفريغ السلة',
            itemRemoved: 'تم حذف العنصر',
            shopNow: 'تسوق الآن',
          },

          order: {
            summary: 'ملخص الطلبية',
            shipping: 'النقل',
            other: 'أخرى',
            totalAmount: 'المبلغ الإجمالي',
            yourOrder: 'طلبيتكم',
            orderId: 'معرف الطلبية',
            checkoutNow: 'الدفع الآن !',
            details: 'تفاصيل الطلبية',
          },

          confirm: {
            removeItem: 'هل أنت متأكد أنك تريد إزالة هذا العنصر؟',
            removeAll: 'هل أنت متأكد أنك تريد حذف كافة العناصر؟',
            deleteTitle: 'تأكيد الحذف',
            clearAllItems: 'حذف الكل',
            remove: 'حذف',
            cancelBack: 'الإلغاء و العودة',
            delete: 'حذف',
          },

          delivery: {
            label: 'التوصيل',
            free: 'مجاني',
            time: 'موعد التسليم',
            expected: 'المتوقع',
            from: 'من',
            to: 'الى',
            cityOnly: 'حاليا، التوصيل متاح فقط لمدينة العيون',
          },

          payment: {
            portal: 'بوابة الدفع',
            creditCard: 'بطاقة بنكية',
            cod: 'الدفع عند الاستلام COD',
            choose: 'المرجو اختيار طريقة الدفع !',
            chosen: 'طريقة الدفع المختارة',
            notChosen: 'لم يتم اختياره بعد !',
            methods: 'طرق الدفع',
            pay: 'دفع',
            checkoutAlert: 'قم أولاً بملء نموذج الدفع، ثم اختر طريقة الدفع 👍🏻',
            // ── Checkout overlay stages ────────────────────────────────────
            overlayUrlTitle:      'بدء عملية الدفع',
            overlayUrlSub:        'جاري إعداد جلستك الآمنة…',
            overlayCodTitle:      'جاري تسجيل طلبيتكم',
            overlayCodSub:        'جاري تأكيد طلبيتكم…',
            overlayRedirectTitle: 'جاري التوجيه نحو الدفع',
            overlayRedirectSub:   'سيتم توجيهكم إلى صفحة الدفع…',
          },

          transaction: {
            info: 'معلومات التحويل',
            code: 'الرمز',
            currency: 'العملة',
            amount: 'المبلغ',
            transactionId: 'معرف التحويل',
            success: 'اكتملت معاملتك بنجاح',
            downloadTicket: 'تنزيل تذكرة الطلبية',
            thank: 'شكرا على ثقتكم !',

            // ── PaymentCallback progress labels ────────────────────────────
            verifying:            'التحقق من الدفع',
            verifyingSub:         'جاري التأكيد مع بوابة الدفع…',
            processing:           'معالجة الطلبية',
            processingSub:        'جاري تسجيل طلبيتكم…',
            emailing:             'إرسال الفاتورة',
            emailingSub:          'جاري إرسال الإيصال إلى بريدكم…',
            done:                 'تم بنجاح !',
            doneSub:              'جاري إعادة التوجيه…',
            pleaseWait:           'يرجى الانتظار…',
            attemptOf:            'المحاولة {{current}} من {{max}}',
            waitingBeforeRetry:   'انتظار قبل المحاولة {{current}} من {{max}}…',

            // ── PaymentCallback retry screen ───────────────────────────────
            retryTitle:           'تعذّر تأكيد الدفع',
            retryDefaultReason:   'تعذّر التحقق من دفعتكم. يرجى المحاولة مجدداً.',
            retryLabel:           'التحويل',
            retryOrder:           'الطلبية',
            retryBtn:             'إعادة المحاولة',
            cancelBtn:            'إلغاء الطلبية',
            retryNote:            'لا تزال عناصرك محجوزة. ستعيدك المحاولة إلى صفحة الدفع دون إنشاء طلبية جديدة.',
            retryBusy:            'يرجى الانتظار…',

            // ── PaymentCallback error screen ───────────────────────────────
            errorTitle:           'حدث خطأ ما',
            errorNote:            'يرجى التواصل مع فريق الدعم مع التفاصيل أعلاه.',

            // ── TransactionFailed — base ───────────────────────────────────
            failedTitle:          'فشل الدفع',
            failedDefaultMsg:     'حدث خطأ أثناء معالجة دفعتكم.',
            failedOrderId:        'معرف الطلبية',
            failedTransactionId:  'معرف التحويل',
            failedErrorCode:      'رمز الخطأ',
            failedSupportNote:    'يرجى الاحتفاظ بمعرف التحويل والتواصل مع الدعم إذا تم خصم المبلغ.',
            failedGoHome:         'الرئيسية',
            failedTryAgain:       'إعادة المحاولة',

            // ── TransactionFailed — category badges ────────────────────────
            failedCategory_cancelled:          'تم إلغاء الدفع',
            failedCategory_insufficient_funds: 'رصيد غير كافٍ',
            failedCategory_card_declined:      'تم رفض البطاقة',
            failedCategory_card_expired:       'البطاقة منتهية الصلاحية',
            failedCategory_auth_failed:        'فشل التحقق 3-D Secure',
            failedCategory_timeout:            'انتهت مهلة الجلسة',
            failedCategory_generic:            'فشل الدفع',

            // ── TransactionFailed — contextual hints ───────────────────────
            failedHintCancelled:  'لقد ألغيت عملية الدفع. لا تزال عناصرك محجوزة — انقر على "إعادة المحاولة" للعودة إلى صفحة الدفع.',
            failedHintFunds:      'تم رفض بطاقتك بسبب عدم كفاية الرصيد. يرجى استخدام بطاقة أخرى أو شحن حسابك والمحاولة مجدداً.',
            failedHintDeclined:   'تم رفض بطاقتك من قِبل البنك. يرجى مراجعة بيانات البطاقة أو التواصل مع البنك قبل إعادة المحاولة.',
            failedHintExpired:    'يبدو أن بطاقتك منتهية الصلاحية. يرجى تحديث بياناتك البنكية والمحاولة مرة أخرى ببطاقة سارية.',
            failedHintAuth:       'فشل التحقق 3-D Secure. يرجى إعادة المحاولة واتباع خطوات التحقق التي أرسلها البنك.',
            failedHintTimeout:    'انتهت مهلة جلسة الدفع. قد يحدث هذا إذا تركت الصفحة مفتوحة طويلاً. يرجى المحاولة مجدداً.',
          },

          form: {
            firstName: {
              label: 'الاسم',
              required: 'الاسم مطلوب',
            },
            lastName: {
              label: 'اللقب',
              required: 'اللقب مطلوب',
            },
            fullName: 'الاسم الكامل',
            email: {
              label: 'البريد الإلكتروني',
              required: 'البريد الإلكتروني مطلوب',
            },
            phone: {
              label: 'رقم الهاتف',
              required: 'رقم الهاتف مطلوب',
              minLength: '10 أحرف على الأقل',
              invalidFormat: 'أدخل رقمًا صحيحًا: 06.. أو 07.. أو +212..',
            },
            address: {
              label: 'العنوان',
              required: 'العنوان مطلوب',
            },
            city: {
              label: 'المدينة',
              required: 'المدينة مطلوبة',
            },
            save: 'حفظ',
            saveChanges: 'حفظ التعديلات',
            modify: 'تعديل',
            submit: 'إرسال',
            clientInfo: 'معلومات العميل',
            selectCity: 'اختر مدينتك',
          },

          review: {
            title: 'مراجعات المنتج',
            add: 'إضافة تقييمك',
            submit: 'إضافة التقييم',
            stars: 'نجوم',
            username: 'اسم المستخدم',
            yourReview: 'تقييمك',
            firstReview: 'كن أول من يضع تقييمًا !',
          },

          pagination: {
            next: 'التالي',
            previous: 'السابق',
          },

          ui: {
            loading: 'جاري التحميل . . .',
            back: 'رجوع',
            search: 'بحث',
            reset: 'إعادة تعيين',
            enterName: 'أدخل اسمًا',
            enterRef: 'أدخل مرجعًا',
            save: 'حفظ',
          },

          home: {
            promotions: 'عروضنا وتخفيضاتنا',
            products: 'منتجاتنا',
            goToShoes: 'الذهاب إلى قسم الأحذية',
            goToSandals: 'الذهاب إلى قسم الصنادل',
            goToShirts: 'الذهاب إلى قسم القمصان',
            goToPants: 'الذهاب إلى قسم السراويل',
            moreShoes: 'المزيد من الأحذية',
            moreSandals: 'المزيد من الصنادل',
            moreShirts: 'المزيد من القمصان',
            morePants: 'المزيد من السراويل',
          },

          admin: {
            orders: {
              remaining: 'الطلبيات المتبقية',
              delivered: 'الطلبيات المسلمة',
              all: 'كل الطلبيات',
              notConfirmed: 'الطلبيات غير المؤكدة',
              showAll: 'عرض كل الطلبيات',
              noRemaining: 'لا توجد طلبية متبقية',
              noDelivered: 'لم يتم تسليم أي طلبية بعد',
              noOrders: 'لا توجد طلبيات بعد',
              treated: 'تمت معالجة الطلبية بنجاح',
              alreadyTreated: 'الطلبية تمت معالجتها بالفعل',
              process: 'معالجة',
              waiting: 'انتظار',
              done: 'تمت',
              treated_label: 'تمت المعالجة',
              status: 'الحالة',
              date: 'التاريخ',
              action: 'الإجراء',
              extractDeliveryForm: 'استخراج نموذج التسليم',
              extractSuccess: 'تم استخراج نموذج التسليم بنجاح',
            },
            deficiency: {
              title: 'نقص الكميات',
              current: 'النقص الحالي',
              showAll: 'عرض كل النقصات',
              process: 'معالجة',
              message: 'يرجى معالجة النقصات أولاً، ثم معالجة الطلبية !',
              confirm: 'تأكيد معالجة النقص',
              success: 'تمت معالجة النقص بنجاح',
              noFound: 'لم يتم العثور على أي نقص',
              quantityRequested: 'الكمية المطلوبة',
            },
            product: {
              select: 'اختر منتجًا',
              mainImage: 'الصورة الرئيسية',
              additionalImages: 'صور إضافية',
              newer: 'منتج حديث',
              uploadedImages: 'الصور المحملة',
              delete: 'حذف منتج',
              modify: 'تعديل المنتج',
              addData: 'إضافة بيانات المنتج',
              add: 'إضافة منتج',
              advancedSearch: 'بحث متقدم',
              management: 'إدارة المنتجات',
              managementOf: 'إدارة المنتجات الخاصة ب',
              noChosen: 'لم يتم اختيار أي منتج',
              noData: 'هذا المنتج لا يحتوي على أي بيانات',
              orderedProducts: 'المنتجات المطلوبة',
              noCategoryData: 'لا توجد بيانات الفئة',
              categoryError: 'أضف فئة للمنتج في الإعدادات أولاً، ثم أضف منتجا',
              addTypes: 'إضافة أنواع المنتجات',
              addCategories: 'إضافة فئات المنتجات',
              selectType: 'حدد نوع المنتج',
              selectCategory: 'المرجو اختيار صنف',
            },
            overview: {
              general: 'نظرة عامة',
              notDeveloped: 'لم يتم تطويره بعد',
            },
            users: {
              manager: 'إدارة المستخدمين',
              add: 'إضافة مستخدم',
              username: 'اسم المستخدم',
              password: 'كلمة المرور',
              confirmPassword: 'تأكيد كلمة المرور',
              passwordMismatch: 'كلمات المرور غير متطابقة',
              role: 'الدور',
              selectRole: 'المرجو اختيار دور',
              manager_role: 'مشرف',
              admin_role: 'مدير',
              deliveryMan: 'رجل التوصيل',
              registrationSuccess: 'تم التسجيل بنجاح',
            },
          },

          tracking: {
            title: 'تتبع حالة الطلبية',
            searching: 'البحث عن الطلبية',
            notValidated: 'جاري معالجة طلبيتكم',
            validated: 'تم معالجة طلبك وهو في طريقه إليك.',
            attempts: 'محاولات البحث',
            limitReached: 'لقد وصلت إلى الحد الأقصى لمحاولات البحث. يمكنك المحاولة مرة أخرى غدًا.',
            noValidId: 'ليس معرف طلبية صالح',
            noOrderFound: 'لا توجد طلبية مرتبطة بمعرف الطلبية المقدم',
            idProvided: 'تم توفير معرف الطلبية التالي',
          },

          auth: {
            welcomeBack: 'مرحبًا بعودتك !',
            signOut: 'تسجيل الخروج',
          },

          footer: {
            followUs: 'تابعنا',
            contactUs: 'تواصل معنا',
            policies: 'السياسات',
            privacyPolicy: 'سياسة الخصوصية',
            usePolicy: 'الشروط العامة للاستخدام',
            policiesNotAccepted: 'يرجى قبول الشروط وسياسة الخصوصية.',
          },

          error: {
            elementNotFound: 'لم يتم العثور على العنصر !',
            pageNotFound: 'أوه ! هذه الصفحة غير موجودة.',
          },
        },
      },
    },
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

interface LangContextProps {
  currentLang: string;
  setCurrentLang: Dispatch<React.SetStateAction<string>>;
}

const langContext = createContext<LangContextProps | undefined>(undefined);

export const LangContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    const lang = sessionStorage.getItem('AlFirdaousStoreLang');
    if (lang) { return JSON.parse(lang); }
    return 'العربية';
  });

  useEffect(() => {
    sessionStorage.setItem('AlFirdaousStoreLang', JSON.stringify(currentLang));
    i18n.changeLanguage(selectedLang(currentLang));
  }, [currentLang]);

  return (
    <langContext.Provider value={{ currentLang, setCurrentLang }}>
      <div>{children}</div>
    </langContext.Provider>
  );
};

export default i18n;

export const useLangContext = (): LangContextProps => {
  const context = useContext(langContext);
  if (context === undefined) {
    throw new Error('useLangContext must be used within a LangContextProvider');
  }
  return context;
};
