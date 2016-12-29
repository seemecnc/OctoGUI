;FLAVOR:Repetier
;TIME:88
;Generated with Cura_SteamEngine 2.3.1
M190 S60
M104 S210
M109 S210
G28 ;Home
G1 Z15.0 F6000 ;Move the platform down 15mm
;Prime the extruder
G92 E0
G1 F200 E3
G92 E0
;LAYER_COUNT:1
;LAYER:0
M107
G1 F2700 E-3.5
G1 Z21
G0 F9000 X1.654 Y.154 Z1.3
;TYPE:WALL-INNER
G1 Z.3
G1 F2700 E0
G1 F1500 X1.605 Y.428 E0.01736
G1 X1.503 Y.708 E0.03594
G1 X1.359 Y.956 E0.05383
G1 X1.181 Y1.171 E0.07123
G1 X.966 Y1.352 E0.08876
G1 X.709 Y1.504 E0.10738
G1 X.45 Y1.601 E0.12463
G1 X.00 Y1.685 E0.15318
G1 X-.45 Y1.601 E0.18172
G1 X-.709 Y1.504 E0.19897
G1 X-.966 Y1.352 E0.21759
G1 X-1.181 Y1.171 E0.23512
G1 X-1.359 Y.956 E0.25253
G1 X-1.503 Y.708 E0.27041
G1 X-1.605 Y.428 E0.28899
G1 X-1.654 Y.154 E0.30635
G1 X-1.658 Y-.133 E0.32425
G1 X-1.611 Y-.411 E0.34184
G1 X-1.458 Y-.844 E0.37047
G1 X-1.159 Y-1.192 E0.39909
G1 X-.948 Y-1.366 E0.41614
G1 X-.693 Y-1.51 E0.43441
G1 X-.43 Y-1.604 E0.45182
G1 X-.136 Y-1.655 E0.47043
G1 X.138 Y-1.655 E0.48752
G1 X.43 Y-1.604 E0.506
G1 X.693 Y-1.51 E0.52342
G1 X.948 Y-1.366 E0.54169
G1 X1.159 Y-1.192 E0.55874
G1 X1.458 Y-.844 E0.58735
G1 X1.611 Y-.411 E0.61599
G1 X1.658 Y-.133 E0.63358
G1 X1.654 Y.154 E0.65148
G0 F9000 X2.154 Y.201
G1 F1500 X2.089 Y.562 E0.67435
G1 X1.959 Y.918 E0.69799
G1 X1.771 Y1.243 E0.7214
G1 X1.535 Y1.526 E0.74438
G1 X1.258 Y1.76 E0.76699
G1 X.927 Y1.956 E0.79098
G1 X.584 Y2.084 E0.81381
G1 X.00 Y2.194 E0.85087
G1 X-.584 Y2.084 E0.88793
G1 X-.927 Y1.956 E0.91077
G1 X-1.258 Y1.76 E0.93476
G1 X-1.535 Y1.526 E0.95737
G1 X-1.771 Y1.243 E0.98035
G1 X-1.959 Y.918 E1.00376
G1 X-2.089 Y.562 E1.0274
G1 X-2.154 Y.201 E1.05027
G1 X-2.158 Y-.17 E1.07341
G1 X-2.097 Y-.536 E1.09655
G1 X-1.898 Y-1.099 E1.13379
G1 X-1.509 Y-1.551 E1.17098
G1 X-1.234 Y-1.778 E1.19322
G1 X-.9 Y-1.967 E1.21715
G1 X-.556 Y-2.09 E1.23993
G1 X-.182 Y-2.155 E1.26361
G1 X.184 Y-2.155 E1.28643
G1 X.556 Y-2.09 E1.30998
G1 X.9 Y-1.967 E1.33276
G1 X1.234 Y-1.778 E1.3567
G1 X1.509 Y-1.551 E1.37893
G1 X1.898 Y-1.099 E1.41612
G1 X2.097 Y-.536 E1.45336
G1 X2.158 Y-.17 E1.4765
G1 X2.154 Y.201 E1.49964
G1 F2700 E-2.00036
G1 Z1.3
G0 F9000 X-60.19 Y34.38 Z1.3
;TYPE:WALL-OUTER
G1 Z.3
G1 F2700 E1.49964
G1 F1500 X-60.079 Y34.381 E1.50656
G1 X-60.02 Y34.396 E1.51036
G1 X-59.969 Y34.42 E1.51388
G1 X-59.924 Y34.452 E1.51732
G1 X-59.88 Y34.496 E1.5212
G1 X-59.847 Y34.543 E1.52478
G1 X-59.824 Y34.593 E1.52821
G1 X-59.808 Y34.65 E1.5319
G1 X-59.808 Y34.763 E1.53895
G1 X-59.824 Y34.824 E1.54288
G1 X-59.88 Y34.919 E1.54976
G1 X-59.922 Y34.962 E1.55351
G1 X-60.184 Y35.148 E1.57355
G1 X-59.721 Y35.849 E1.62594
G1 X-56.085 Y41.351 E2.03721
G1 X-55.722 Y41.793 E2.07288
G1 X-51.514 Y46.92 E2.48652
G1 X-51.128 Y47.302 E2.52039
G1 X-46.392 Y51.987 E2.93583
G1 X-45.996 Y52.305 E2.9675
G1 X-40.772 Y56.499 E3.38529
G1 X-40.372 Y56.757 E3.41497
G1 X-34.718 Y60.406 E3.83463
G1 X-34.324 Y60.606 E3.86218
G1 X-28.292 Y63.667 E4.28402
G1 X-27.901 Y63.817 E4.31013
G1 X-21.562 Y66.248 E4.73352
G1 X-21.196 Y66.346 E4.75715
G1 X-14.603 Y68.12 E5.18294
G1 X-14.253 Y68.176 E5.20504
G1 X-7.488 Y69.263 E5.63234
G1 X-7.173 Y69.28 E5.65201
G1 X-.041 Y69.68 E6.09748
G1 X-.041 Y54.255 E7.05942
G1 X-1.086 Y54.255 E7.12459
G1 X-1.086 Y53.924 E7.14523
G1 X-.041 Y53.924 E7.18838
G1 X.041 Y53.924 E7.19265
G1 X.586 Y53.924 E7.22664
G1 X-.873 Y50.582 E7.45405
G1 X-1.073 Y50.125 E7.48516
G1 X-.587 Y50.125 E7.51547
G1 X-.041 Y50.125 E7.54952
G1 X-.041 Y34.767 E8.50729
G1 X-5.084 Y34.375 E8.82273
G1 X-5.347 Y34.318 E8.83951
G1 X-9.786 Y33.343 E9.12294
G1 X-10.278 Y33.161 E9.15565
G1 X-14.297 Y31.674 E9.4229
G1 X-14.987 Y31.303 E9.47175
G1 X-18.53 Y29.4 E9.72256
G1 X-19.375 Y28.782 E9.78784
G1 X-22.422 Y26.553 E10.02328
G1 X-23.351 Y25.652 E10.10399
G1 X-25.869 Y23.211 E10.32269
G1 X-26.829 Y21.979 E10.42009
G1 X-28.83 Y19.412 E10.62307
G1 X-29.757 Y17.807 E10.73866
G1 X-28.695 Y19.315 E10.75759
G1 X-26.822 Y21.973 E10.79303
G1 X-25.753 Y23.099 E10.80933
G1 X-23.34 Y25.639 E10.84817
G1 X-22.329 Y26.432 E10.86153
G1 X-19.361 Y28.761 E10.90313
G1 X-18.46 Y29.275 E10.91384
G1 X-14.97 Y31.27 E10.95891
G1 X-14.25 Y31.552 E10.96678
G1 X-10.261 Y33.114 E11.01455
G1 X-9.761 Y33.229 E11.0196
G1 X-5.335 Y34.255 E11.07062
G0 X-5.077 Y34.276
G1 X-.041 Y34.686 E11.12734
G1 X-.041 Y2.695 E13.12239
G1 X-.718 Y2.567 E13.16536
G1 X-1.146 Y2.407 E13.19385
G1 X-1.543 Y2.173 E13.22259
G1 X-1.892 Y1.879 E13.25105
G1 X-2.183 Y1.529 E13.27943
G1 X-2.415 Y1.128 E13.30833
G1 X-2.573 Y.696 E13.33701
G1 X-2.654 Y.248 E13.3654
G1 X-2.658 Y-.208 E13.39384
G1 X-2.582 Y-.664 E13.42267
G1 X-2.354 Y-1.311 E13.46545
G1 X-30.07 Y-17.307 E15.46111
G1 X-32.234 Y-12.735 E15.77656
G1 X-32.342 Y-12.508 E15.79223
G1 X-33.668 Y-8.164 E16.07548
G1 X-33.818 Y-7.673 E16.10749
G1 X-34.458 Y-3.443 E16.37429
G1 X-34.575 Y-2.674 E16.4228
G1 X-34.591 Y1.345 E16.67344
G1 X-34.596 Y2.381 E16.73804
G1 X-34.064 Y6.113 E16.97314
G1 X-33.882 Y7.386 E17.05333
G1 X-32.889 Y10.742 E17.27159
G1 X-32.447 Y12.234 E17.36863
G1 X-31.08 Y15.185 E17.57145
G1 X-30.303 Y16.862 E17.68671
G1 X-31.231 Y15.255 E17.70618
G1 X-32.455 Y12.238 E17.74177
G1 X-33.043 Y10.788 E17.75845
G1 X-33.897 Y7.391 E17.79688
G1 X-34.214 Y6.135 E17.81063
G1 X-34.621 Y2.384 E17.85217
G1 X-34.734 Y1.345 E17.86346
G1 X-34.612 Y-2.675 E17.90866
G1 X-34.587 Y-3.463 E17.9172
G1 X-33.868 Y-7.681 E17.96524
G1 X-33.779 Y-8.198 E17.971
G1 X-32.405 Y-12.527 E18.02225
G0 X-32.325 Y-12.779
G1 X-30.14 Y-17.347 E18.07968
G1 X-42.532 Y-24.499 E18.97196
G1 X-42.803 Y-24.213 E18.99653
G1 X-42.265 Y-23.386 E19.05805
G1 X-42.151 Y-23.211 E19.07108
G1 X-42.533 Y-23.211 E19.07622
G1 X-43.071 Y-24.038 E19.11559
G1 X-43.637 Y-24.906 E19.18022
G1 X-44.742 Y-23.211 E19.3064
G1 X-45.126 Y-23.211 E19.33035
G0 X-45.012 Y-23.386
G1 X-43.906 Y-25.081 E19.41125
G1 X-43.806 Y-25.235 E19.4227
G1 X-44.674 Y-25.735 E19.48517
G1 X-44.753 Y-25.781 E19.49087
G1 X-60.374 Y-34.798 E20.61569
G1 X-60.332 Y-34.869 E20.62083
G1 X-44.712 Y-25.854 E20.80633
G1 X-44.441 Y-26.14 E20.82479
G1 X-45.109 Y-27.165 E20.90109
G1 X-45.224 Y-27.341 E20.9142
G1 X-44.84 Y-27.341 E20.9194
G1 X-44.173 Y-26.316 E20.96827
G1 X-43.637 Y-25.493 E21.02952
G1 X-42.432 Y-27.341 E21.1671
G1 X-42.048 Y-27.341 E21.19105
G0 X-42.162 Y-27.166
G1 X-43.368 Y-25.318 E21.27927
G1 X-43.482 Y-25.143 E21.2923
G1 X-42.57 Y-24.617 E21.35796
G0 X-42.492 Y-24.572
G1 X-30.098 Y-17.419 E21.50617
G1 X-27.241 Y-21.585 E21.8212
G1 X-27.056 Y-21.788 E21.83833
G1 X-23.99 Y-25.147 E22.12195
G1 X-23.589 Y-25.479 E22.15441
G1 X-20.292 Y-28.214 E22.42156
G1 X-19.624 Y-28.627 E22.47054
G1 X-16.201 Y-30.743 E22.7215
G1 X-15.245 Y-31.164 E22.78664
G1 X-11.792 Y-32.688 E23.02202
G1 X-10.547 Y-33.042 E23.10274
G1 X-7.177 Y-34 E23.32123
G1 X-5.627 Y-34.216 E23.41883
G1 X-2.401 Y-34.666 E23.62196
G1 X-.536 Y-34.666 E23.73826
G1 X-2.385 Y-34.5 E23.75735
G1 X-5.625 Y-34.207 E23.79281
G1 X-7.139 Y-33.844 E23.80906
G1 X-10.542 Y-33.026 E23.8474
G1 X-11.734 Y-32.548 E23.86059
G1 X-15.235 Y-31.142 E23.90171
G1 X-16.129 Y-30.621 E23.91215
G1 X-19.604 Y-28.596 E23.95647
G1 X-20.21 Y-28.112 E23.96429
G1 X-23.556 Y-25.441 E24.0123
G1 X-23.904 Y-25.068 E24.01737
G1 X-27.007 Y-21.745 E24.06864
G0 X-27.157 Y-21.528
G1 X-30.028 Y-17.379 E24.12559
G1 X-2.313 Y-1.383 E24.45481
G1 X-1.862 Y-1.908 E24.49798
G1 X-1.514 Y-2.194 E24.52607
G1 X-1.11 Y-2.423 E24.55503
G1 X-.682 Y-2.576 E24.58337
G1 X-.228 Y-2.655 E24.61211
G1 X.23 Y-2.655 E24.64067
G1 X.682 Y-2.576 E24.66929
G1 X1.11 Y-2.423 E24.69763
G1 X1.514 Y-2.194 E24.72659
G1 X1.862 Y-1.908 E24.75469
G1 X2.313 Y-1.383 E24.79785
G1 X30.028 Y-17.379 E26.79345
G1 X27.158 Y-21.527 E27.10801
G1 X27.007 Y-21.745 E27.12455
G1 X23.905 Y-25.068 E27.40804
G1 X23.556 Y-25.441 E27.4399
G1 X20.21 Y-28.112 E27.70689
G1 X19.604 Y-28.596 E27.75526
G1 X16.13 Y-30.62 E28.006
G1 X15.235 Y-31.142 E28.07061
G1 X11.736 Y-32.546 E28.30573
G1 X10.542 Y-33.026 E28.38598
G1 X7.14 Y-33.843 E28.60417
G1 X5.625 Y-34.207 E28.70134
G1 X2.386 Y-34.499 E28.90415
G1 X.536 Y-34.666 E29.01999
G1 X2.401 Y-34.666 E29.03973
G1 X5.625 Y-34.217 E29.07597
G1 X7.177 Y-34 E29.09301
G1 X10.547 Y-33.042 E29.13184
G1 X11.792 Y-32.688 E29.14569
G1 X15.245 Y-31.165 E29.18742
G1 X16.201 Y-30.743 E29.19859
G1 X19.624 Y-28.627 E29.24336
G1 X20.292 Y-28.214 E29.25181
G1 X23.588 Y-25.481 E29.30014
G1 X23.99 Y-25.147 E29.30592
G1 X27.055 Y-21.789 E29.35724
G0 X27.241 Y-21.585
G1 X30.099 Y-17.419 E29.41478
G1 X42.931 Y-24.827 E30.3388
G1 X43.022 Y-24.879 E30.34534
G1 X43.607 Y-25.217 E30.38747
G1 X43.678 Y-25.348 E30.39676
G1 X43.678 Y-25.448 E30.403
G1 X43.678 Y-27.166 E30.51014
G1 X44.009 Y-27.166 E30.53078
G1 X44.009 Y-25.448 E30.6007
G1 X60.332 Y-34.869 E31.77603
G1 X60.375 Y-34.798 E31.7812
G1 X44.051 Y-25.376 E31.97558
G1 X44.009 Y-25.352 E31.97639
G1 X44.286 Y-24.808 E32.01446
G1 X45.112 Y-23.184 E32.12808
G1 X45.187 Y-23.036 E32.13843
G1 X44.823 Y-23.036 E32.14396
G1 X43.997 Y-24.66 E32.21757
G1 X43.691 Y-24.66 E32.23665
G1 X43.534 Y-24.35 E32.25832
G1 X42.864 Y-23.036 E32.35031
G1 X42.5 Y-23.036 E32.37301
G0 X42.574 Y-23.183
G1 X43.243 Y-24.497 E32.43287
G1 X42.973 Y-24.754 E32.44741
G1 X30.14 Y-17.347 E32.60083
G1 X32.325 Y-12.779 E32.91662
G1 X32.404 Y-12.529 E32.93297
G1 X33.779 Y-8.198 E33.21635
G1 X33.867 Y-7.682 E33.24899
G1 X34.587 Y-3.463 E33.5159
G1 X34.611 Y-2.676 E33.565
G1 X34.734 Y1.345 E33.81588
G1 X34.622 Y2.382 E33.88093
G1 X34.214 Y6.135 E34.11635
G1 X33.899 Y7.389 E34.19699
G1 X33.043 Y10.788 E34.41558
G1 X32.456 Y12.237 E34.51307
G1 X31.231 Y15.255 E34.7162
G1 X30.303 Y16.862 E34.83192
G1 X31.079 Y15.186 E34.85089
G1 X32.447 Y12.234 E34.88634
G1 X32.888 Y10.743 E34.90267
G1 X33.882 Y7.386 E34.94149
G1 X34.063 Y6.114 E34.95487
G1 X34.596 Y2.381 E34.99663
G1 X34.592 Y1.346 E35.00737
G1 X34.575 Y-2.674 E35.05194
G1 X34.459 Y-3.443 E35.05973
G1 X33.818 Y-7.673 E35.1072
G1 X33.669 Y-8.163 E35.1122
G1 X32.342 Y-12.508 E35.16328
G0 X32.235 Y-12.735
G1 X30.07 Y-17.307 E35.22006
G1 X2.354 Y-1.311 E35.54935
G1 X2.582 Y-.664 E35.59213
G1 X2.658 Y-.208 E35.62096
G1 X2.654 Y.248 E35.6494
G1 X2.573 Y.696 E35.67779
G1 X2.415 Y1.128 E35.70647
G1 X2.183 Y1.529 E35.73536
G1 X1.892 Y1.879 E35.76375
G1 X1.543 Y2.173 E35.79221
G1 X1.146 Y2.407 E35.82095
G1 X.718 Y2.567 E35.84944
G1 X.041 Y2.695 E35.89241
G1 X.041 Y34.686 E36.2196
G1 X5.076 Y34.277 E36.53463
G1 X5.335 Y34.255 E36.55084
G1 X9.761 Y33.23 E36.83416
G1 X10.261 Y33.114 E36.86617
G1 X14.249 Y31.553 E37.13325
G1 X14.97 Y31.27 E37.18155
G1 X18.458 Y29.277 E37.43208
G1 X19.361 Y28.761 E37.49694
G1 X22.328 Y26.433 E37.73212
G1 X23.34 Y25.639 E37.81234
G1 X25.751 Y23.1 E38.03069
G1 X26.822 Y21.973 E38.12765
G1 X28.693 Y19.317 E38.33026
G1 X29.757 Y17.807 E38.44546
G1 X28.83 Y19.412 E38.4649
G1 X26.83 Y21.978 E38.50074
G1 X25.869 Y23.211 E38.51772
G1 X23.353 Y25.65 E38.55715
G1 X22.422 Y26.553 E38.57115
G1 X19.376 Y28.781 E38.61286
G1 X18.53 Y29.4 E38.62407
G1 X14.988 Y31.302 E38.6688
G1 X14.297 Y31.674 E38.67723
G1 X10.278 Y33.161 E38.72515
G1 X9.787 Y33.343 E38.73082
G1 X5.348 Y34.317 E38.78129
G0 X5.084 Y34.375
G1 X.041 Y34.767 E38.83762
G1 X.041 Y50.125 E38.99469
G1 X1.085 Y50.125 E39.0598
G1 X1.085 Y50.456 E39.08044
G1 X.041 Y50.456 E39.12354
G1 X-.041 Y50.456 E39.12698
G1 X-.587 Y50.456 E39.14952
G1 X.871 Y53.798 E39.2912
G1 X1.071 Y54.255 E39.32231
G1 X.586 Y54.255 E39.35256
G1 X.041 Y54.255 E39.37422
G1 X.041 Y69.68 E39.53198
G1 X7.172 Y69.281 E39.97738
G1 X7.488 Y69.263 E39.99712
G1 X14.252 Y68.177 E40.42435
G1 X14.603 Y68.12 E40.44652
G1 X21.195 Y66.347 E40.87223
G1 X21.562 Y66.248 E40.89593
G1 X27.9 Y63.818 E41.31924
G1 X28.292 Y63.667 E41.34544
G1 X34.322 Y60.607 E41.76714
G1 X34.718 Y60.406 E41.79483
G1 X40.37 Y56.759 E42.21431
G1 X40.772 Y56.499 E42.24417
G1 X45.994 Y52.307 E42.66178
G1 X46.392 Y51.987 E42.69363
G1 X51.127 Y47.303 E43.10898
G1 X51.514 Y46.92 E43.14294
G1 X55.721 Y41.794 E43.55649
G1 X56.085 Y41.351 E43.59224
G1 X59.72 Y35.849 E44.00348
G1 X60.184 Y35.148 E44.05591
G1 X59.922 Y34.962 E44.07595
G1 X59.88 Y34.919 E44.0797
G1 X59.846 Y34.871 E44.08336
G1 X59.824 Y34.824 E44.0866
G1 X59.808 Y34.762 E44.09059
G1 X59.803 Y34.707 E44.09404
G1 X59.808 Y34.65 E44.09761
G1 X59.847 Y34.543 E44.10471
G1 X59.88 Y34.496 E44.10829
G1 X59.924 Y34.452 E44.11217
G1 X59.969 Y34.42 E44.11561
G1 X60.02 Y34.396 E44.11913
G1 X60.079 Y34.381 E44.12292
G1 X60.136 Y34.376 E44.12649
G1 X60.19 Y34.38 E44.12987
G1 X60.253 Y34.397 E44.13394
G1 X60.542 Y34.529 E44.15375
G1 X63.056 Y29.498 E44.50449
G1 X63.865 Y27.88 E44.6173
G1 X65.756 Y22.859 E44.9519
G1 X66.405 Y21.138 E45.0666
G1 X67.757 Y15.981 E45.39908
G1 X68.233 Y14.169 E45.51591
G1 X69.041 Y8.928 E45.84662
G1 X69.332 Y7.048 E45.96525
G1 X69.592 Y1.791 E46.2935
G1 X69.689 Y-.146 E46.41444
G1 X69.408 Y-5.374 E46.74095
G1 X69.302 Y-7.34 E46.86373
G1 X68.486 Y-12.483 E47.18847
G1 X68.173 Y-14.456 E47.31305
G1 X66.84 Y-19.45 E47.6354
G1 X66.315 Y-21.416 E47.7623
G1 X64.483 Y-26.222 E48.08305
G1 X63.748 Y-28.148 E48.21161
G1 X61.446 Y-32.705 E48.53
G1 X60.457 Y-34.662 E48.66674
G1 X61.588 Y-32.778 E48.68871
G1 X63.754 Y-28.151 E48.74136
G1 X64.632 Y-26.278 E48.76288
G1 X66.322 Y-21.418 E48.81623
G1 X66.993 Y-19.491 E48.83743
G1 X68.181 Y-14.457 E48.89108
G1 X68.641 Y-12.509 E48.91183
G1 X69.31 Y-7.341 E48.96558
G1 X69.564 Y-5.383 E48.98599
G1 X69.698 Y-.147 E49.04004
G1 X69.749 Y1.799 E49.06042
G1 X69.343 Y7.048 E49.11561
G1 X69.195 Y8.951 E49.13558
G1 X68.244 Y14.171 E49.19058
G1 X67.907 Y16.021 E49.21028
G1 X66.416 Y21.141 E49.26554
G1 X65.9 Y22.912 E49.28459
G1 X63.878 Y27.884 E49.34036
G1 X63.194 Y29.566 E49.35937
G1 X60.549 Y34.532 E49.41569
G0 X60.539 Y34.55
G0 X60.532 Y34.562
G1 X60.522 Y34.581 E49.41641
G1 X60.507 Y34.609 E49.41766
G1 X60.252 Y35.088 E49.4515
G1 X60.24 Y35.11 E49.4527
G0 X60.231 Y35.127
G0 X60.212 Y35.163
G1 X59.813 Y35.911 E49.46042
G1 X56.132 Y41.382 E49.52909
G1 X55.807 Y41.865 E49.53542
G1 X51.559 Y46.956 E49.60486
G1 X51.204 Y47.381 E49.61082
G1 X46.433 Y52.029 E49.68017
G1 X46.062 Y52.39 E49.68568
G1 X40.809 Y56.546 E49.75507
G0 X40.428 Y56.847
G1 X34.75 Y60.457 E49.82436
G0 X34.37 Y60.699
G1 X28.319 Y63.723 E49.89402
G0 X27.937 Y63.914
G1 X21.584 Y66.307 E49.96345
G0 X21.222 Y66.444
G1 X14.621 Y68.182 E50.03326
G0 X14.268 Y68.275
G1 X7.499 Y69.328 E50.10332
G0 X7.177 Y69.378
G1 X.044 Y69.746 E50.17595
G1 X.00 Y69.749 E50.1787
G1 X-.043 Y69.747 E50.18139
G1 X-7.177 Y69.378 E50.25497
G0 X-7.497 Y69.329
G1 X-14.268 Y68.275 E50.32596
G0 X-14.619 Y68.183
G1 X-21.222 Y66.444 E50.39668
G0 X-21.584 Y66.308
G1 X-27.937 Y63.914 E50.46701
G0 X-28.319 Y63.723
G1 X-34.37 Y60.699 E50.53664
G0 X-34.749 Y60.458
G1 X-40.428 Y56.847 E50.60639
G0 X-40.808 Y56.547
G1 X-46.062 Y52.39 E50.67624
G1 X-46.432 Y52.03 E50.68181
G1 X-51.204 Y47.381 E50.75128
G1 X-51.557 Y46.958 E50.75719
G1 X-55.807 Y41.865 E50.82676
G1 X-56.131 Y41.383 E50.83305
G1 X-59.813 Y35.911 E50.90135
G1 X-60.21 Y35.162 E50.90894
G0 X-60.23 Y35.125
G1 X-60.238 Y35.11 E50.90948
G1 X-60.505 Y34.609 E50.94489
G1 X-60.531 Y34.561 E50.94769
G1 X-60.538 Y34.549 E50.94856
G1 X-60.547 Y34.533 E50.9497
G1 X-63.194 Y29.566 E51.3007
G1 X-63.877 Y27.886 E51.4138
G1 X-65.9 Y22.912 E51.74866
G1 X-66.415 Y21.142 E51.86362
G1 X-67.907 Y16.021 E52.19626
G1 X-68.243 Y14.172 E52.31346
G1 X-69.195 Y8.951 E52.64442
G1 X-69.342 Y7.049 E52.76339
G1 X-69.749 Y1.799 E53.09178
G1 X-69.699 Y-.146 E53.21311
G1 X-69.564 Y-5.383 E53.53981
G1 X-69.311 Y-7.34 E53.66287
G1 X-68.641 Y-12.509 E53.98792
G1 X-68.182 Y-14.457 E54.11273
G1 X-66.993 Y-19.491 E54.43531
G1 X-66.323 Y-21.418 E54.56253
G1 X-64.632 Y-26.278 E54.88344
G1 X-63.755 Y-28.15 E55.01236
G1 X-61.587 Y-32.778 E55.33107
G1 X-60.46 Y-34.655 E55.46761
G1 X-61.444 Y-32.707 E55.48914
G1 X-63.748 Y-28.148 E55.542
G1 X-64.482 Y-26.222 E55.56367
G1 X-66.315 Y-21.416 E55.61751
G1 X-66.839 Y-19.451 E55.63882
G1 X-68.173 Y-14.456 E55.69296
G1 X-68.485 Y-12.485 E55.71377
G1 X-69.302 Y-7.34 E55.76765
G1 X-69.407 Y-5.375 E55.78815
G1 X-69.689 Y-.146 E55.84264
G1 X-69.593 Y1.79 E55.86257
G1 X-69.332 Y7.048 E55.91705
G1 X-69.043 Y8.926 E55.93635
G1 X-68.233 Y14.169 E55.99058
G1 X-67.758 Y15.981 E56.00992
G1 X-66.405 Y21.138 E56.0644
G1 X-65.757 Y22.858 E56.08318
G1 X-63.865 Y27.88 E56.13832
G1 X-63.057 Y29.497 E56.15716
G1 X-60.542 Y34.529 E56.21289
G0 X-60.253 Y34.397
G1 X-60.19 Y34.38 E56.21509
G1 F2700 E52.71509
G1 Z1.3
G0 F9000 X30.159 Y17.112 Z1.3
G1 Z.3
G1 F2700 E56.21509
G1 F1500 X29.904 Y17.555 E56.24697
G1 X29.877 Y17.601 E56.2503
G1 X29.869 Y17.615 E56.2513
G1 X29.852 Y17.643 E56.25334
G0 X29.602 Y17.462
G1 X29.558 Y17.418 E56.25576
G1 X29.503 Y17.324 E56.26167
G1 X29.487 Y17.262 E56.26566
G1 X29.488 Y17.147 E56.27283
G1 X29.526 Y17.043 E56.27974
G1 X29.559 Y16.996 E56.28332
G1 X29.601 Y16.954 E56.28702
G1 X29.65 Y16.919 E56.29078
G1 X29.698 Y16.896 E56.2941
G1 X29.757 Y16.881 E56.29789
G1 X29.814 Y16.876 E56.30146
G1 X29.872 Y16.88 E56.30509
G1 X29.928 Y16.895 E56.3087
G1 X30.21 Y17.024 E56.32804
G0 X30.195 Y17.05
G0 X30.188 Y17.062
G0 X30.175 Y17.085
G0 X30.159 Y17.112
G1 F2700 E52.82804
G1 Z1.3
G0 F9000 X-.286 Y-34.666 Z1.3
G1 Z.3
G1 F2700 E56.32804
G1 F1500 X.254 Y-34.666 E56.36172
G1 X.311 Y-34.666 E56.36527
G1 X.326 Y-34.666 E56.36621
G1 X.357 Y-34.666 E56.36814
G0 X.326 Y-34.356
G1 X.311 Y-34.299 E56.3689
G1 X.254 Y-34.203 E56.37431
G1 X.211 Y-34.16 E56.3781
G1 X.117 Y-34.105 E56.3849
G1 X.054 Y-34.089 E56.38895
G1 X.00 Y-34.084 E56.39233
G1 X-.117 Y-34.105 E56.39974
G1 X-.211 Y-34.16 E56.40654
G1 X-.286 Y-34.248 E56.41375
G1 X-.311 Y-34.299 E56.41729
G1 X-.326 Y-34.356 E56.42096
G1 X-.357 Y-34.666 E56.44039
G0 X-.326 Y-34.666
G0 X-.311 Y-34.666
G0 X-.286 Y-34.666
G1 F2700 E52.94039
G1 Z1.3
G0 F9000 X-7.614 Y-69.241 Z1.3
G1 Z.3
G1 F2700 E56.44039
G1 F1500 X-3.584 Y-69.657 E56.69305
G1 X-.358 Y-69.739 E56.8943
G1 X-.337 Y-69.74 E56.89561
G1 X-.323 Y-69.741 E56.89648
G1 X-.301 Y-69.742 E56.89786
G1 X.00 Y-69.75 E56.91664
G1 X.299 Y-69.743 E56.93529
G1 X.336 Y-69.742 E56.93759
G1 X.356 Y-69.741 E56.93884
G1 X3.584 Y-69.657 E57.14022
G1 X7.614 Y-69.241 E57.39288
G1 X3.575 Y-69.484 E57.43645
G1 X.356 Y-69.678 E57.48382
G1 X.327 Y-69.357 E57.49821
G1 X.288 Y-69.25 E57.50434
G1 X.255 Y-69.204 E57.50787
G1 X.212 Y-69.161 E57.51166
G1 X.164 Y-69.127 E57.51533
G1 X.117 Y-69.105 E57.51857
G1 X.055 Y-69.089 E57.52256
G1 X.00 Y-69.084 E57.52601
G1 X-.117 Y-69.105 E57.53342
G1 X-.212 Y-69.161 E57.5403
G1 X-.255 Y-69.204 E57.54409
G1 X-.288 Y-69.25 E57.5476
G1 X-.311 Y-69.3 E57.55076
G1 X-.327 Y-69.357 E57.55393
G1 X-.356 Y-69.678 E57.56843
G1 X-3.573 Y-69.485 E57.61516
G1 X-7.614 Y-69.241 E57.65856
G0 F9000 X-7.894 Y-69.212
G1 F1500 X-10.709 Y-68.748 E57.83648
G1 X-14.718 Y-68.086 E58.08988
G1 X-10.737 Y-68.918 E58.13366
G1 X-7.894 Y-69.212 E58.16452
G1 F2700 E54.66452
G1 Z1.3
G0 F9000 X-17.772 Y-67.448 Z1.3
G1 Z.3
G1 F2700 E58.16452
G1 F1500 X-15.006 Y-68.026 E58.34074
G1 X-17.726 Y-67.283 E58.37071
G1 X-21.683 Y-66.2 E58.62655
G1 X-17.772 Y-67.448 E58.67043
G1 F2700 E55.17043
G1 Z1.3
G0 F9000 X-24.548 Y-65.106 Z1.3
G1 Z.3
G1 F2700 E58.67043
G1 F1500 X-28.423 Y-63.601 E58.92968
G1 X-24.611 Y-65.266 E58.97414
G1 X-21.945 Y-66.117 E59.14866
G1 X-24.548 Y-65.106 E59.17834
G1 F2700 E55.67834
G1 Z1.3
G0 F9000 X-34.829 Y-60.333 Z1.3
G1 Z.3
G1 F2700 E59.17834
G1 F1500 X-31.19 Y-62.392 E59.43909
G1 X-28.646 Y-63.503 E59.61221
G1 X-31.111 Y-62.24 E59.64161
G1 X-34.829 Y-60.333 E59.68615
G1 F2700 E56.18615
G1 Z1.3
G0 F9000 X-40.919 Y-56.384 Z1.3
G1 Z.3
G1 F2700 E59.68615
G1 F1500 X-37.447 Y-58.852 E59.9518
G1 X-35.06 Y-60.203 E60.12285
G1 X-37.353 Y-58.709 E60.15193
G1 X-40.919 Y-56.384 E60.19725
G1 F2700 E56.69725
G1 Z1.3
G0 F9000 X-43.303 Y-54.691 Z1.3
G1 Z.3
G1 F2700 E60.19725
G1 F1500 X-41.062 Y-56.283 E60.36868
G1 X-43.194 Y-54.557 E60.39802
G1 X-46.514 Y-51.869 E60.66442
G1 X-43.303 Y-54.691 E60.71038
G1 F2700 E57.21038
G1 Z1.3
G0 F9000 X-46.664 Y-51.737 Z1.3
G1 Z.3
G1 F2700 E60.71038
G1 F1500 X-48.578 Y-49.828 E60.87896
G1 X-51.627 Y-46.786 E61.14756
G1 X-48.7 Y-49.948 E61.19356
G1 X-46.664 Y-51.737 E61.22272
G1 F2700 E57.72272
G1 Z1.3
G0 F9000 X-53.576 Y-44.682 Z1.3
G1 Z.3
G1 F2700 E61.22272
G1 F1500 X-51.757 Y-46.646 E61.38966
G1 X-53.443 Y-44.575 E61.41787
G1 X-56.188 Y-41.202 E61.68907
G1 X-53.576 Y-44.682 E61.73531
G1 F2700 E58.23531
G1 Z1.3
G0 F9000 X-56.297 Y-41.057 Z1.3
G1 Z.3
G1 F2700 E61.73531
G1 F1500 X-57.746 Y-38.844 E61.90027
G1 X-60.145 Y-35.179 E62.17344
G1 X-57.889 Y-38.936 E62.22
G1 X-56.297 Y-41.057 E62.24838
G1 F2700 E58.74838
G1 Z1.3
G0 F9000 X-29.487 Y17.262 Z1.3
G1 Z.3
G1 F2700 E62.24838
G1 F1500 X-29.503 Y17.324 E62.25237
G1 X-29.558 Y17.418 E62.25916
G1 X-29.602 Y17.462 E62.26304
G1 X-29.852 Y17.643 E62.28229
G0 X-29.867 Y17.617
G0 X-29.876 Y17.602
G0 X-29.902 Y17.556
G1 X-30.158 Y17.114 E62.31414
G1 X-30.189 Y17.06 E62.31803
G1 X-30.195 Y17.049 E62.31881
G1 X-30.21 Y17.024 E62.32063
G0 X-29.928 Y16.895
G1 X-29.872 Y16.88 E62.32199
G1 X-29.757 Y16.881 E62.32755
G1 X-29.698 Y16.896 E62.33135
G1 X-29.65 Y16.919 E62.33467
G1 X-29.601 Y16.954 E62.33842
G1 X-29.559 Y16.996 E62.34213
G1 X-29.526 Y17.043 E62.34571
G1 X-29.502 Y17.094 E62.34922
G1 X-29.488 Y17.147 E62.35264
G1 X-29.483 Y17.206 E62.35634
G1 X-29.487 Y17.262 E62.35984
G1 F2700 E58.85984
G1 Z1.3
G0 F9000 X10.71 Y-68.747 Z1.3
G1 Z.3
G1 F2700 E62.35984
G1 F1500 X7.894 Y-69.212 E62.53783
G1 X10.737 Y-68.918 E62.56884
G1 X14.718 Y-68.086 E62.82247
G1 X10.71 Y-68.747 E62.86622
G1 F2700 E59.36622
G1 Z1.3
G0 F9000 X17.772 Y-67.448 Z1.3
G1 Z.3
G1 F2700 E62.86622
G1 F1500 X21.683 Y-66.2 E63.12224
G1 X17.728 Y-67.281 E63.16614
G1 X15.006 Y-68.026 E63.34214
G1 X17.772 Y-67.448 E63.37258
G1 F2700 E59.87258
G1 Z1.3
G0 F9000 X24.549 Y-65.105 Z1.3
G1 Z.3
G1 F2700 E63.37258
G1 F1500 X21.945 Y-66.117 E63.5468
G1 X24.611 Y-65.266 E63.577
G1 X28.423 Y-63.601 E63.83641
G1 X24.549 Y-65.105 E63.88091
G1 F2700 E60.38091
G1 Z1.3
G0 F9000 X31.19 Y-62.392 Z1.3
G1 Z.3
G1 F2700 E63.88091
G1 F1500 X34.829 Y-60.333 E64.14166
G1 X31.112 Y-62.238 E64.18636
G1 X28.646 Y-63.503 E64.3592
G1 X31.19 Y-62.392 E64.38918
G1 F2700 E60.88918
G1 Z1.3
G0 F9000 X37.447 Y-58.852 Z1.3
G1 Z.3
G1 F2700 E64.38918
G1 F1500 X40.919 Y-56.384 E64.65483
G1 X37.354 Y-58.708 E64.70014
G1 X35.06 Y-60.203 E64.87089
G1 X37.447 Y-58.852 E64.9003
G1 F2700 E61.4003
G1 Z1.3
G0 F9000 X41.062 Y-56.283 Z1.3
G1 Z.3
G1 F2700 E64.9003
G1 F1500 X43.303 Y-54.691 E65.07173
G1 X46.514 Y-51.869 E65.33832
G1 X43.195 Y-54.556 E65.38405
G1 X41.062 Y-56.283 E65.41343
G1 F2700 E61.91343
G1 Z1.3
G0 F9000 X48.7 Y-49.948 Z1.3
G1 Z.3
G1 F2700 E65.41343
G1 F1500 X51.627 Y-46.786 E65.68214
G1 X48.58 Y-49.826 E65.72796
G1 X46.664 Y-51.737 E65.89672
G1 X48.7 Y-49.948 E65.92581
G1 F2700 E62.42581
G1 Z1.3
G0 F9000 X51.757 Y-46.646 Z1.3
G1 Z.3
G1 F2700 E65.92581
G1 F1500 X53.576 Y-44.682 E66.09275
G1 X56.188 Y-41.202 E66.3641
G1 X53.444 Y-44.574 E66.41014
G1 X51.757 Y-46.646 E66.43836
G1 F2700 E62.93836
G1 Z1.3
G0 F9000 X60.153 Y-35.168 Z1.3
G1 Z.3
G1 F2700 E66.43836
G1 F1500 X57.748 Y-38.842 E66.71221
G1 X56.297 Y-41.057 E66.87734
G1 X57.889 Y-38.936 E66.90547
G1 X60.153 Y-35.168 E66.95193
G1 F2700 E63.45193
G1 Z1.3
G0 F9000 X1.43 Y.016 Z1.3
;TYPE:SKIN
G1 Z.3
G1 F2700 E66.95193
G1 F1500 X-.014 Y-1.429 E67.07933
G0 X-.102 Y-1.517
G0 F9000 X-.596 Y-1.303
G1 F1500 X1.303 Y.596 E67.24681
G0 X1.391 Y.684
G0 F9000 X1.015 Y1.015
G1 F1500 X-1.014 Y-1.014 E67.42576
G0 X-1.102 Y-1.102
G0 F9000 X-1.305 Y-.598
G1 F1500 X.597 Y1.304 E67.5935
G0 X.685 Y1.392
G0 F9000 X.033 Y1.447
G1 F1500 X-1.431 Y-.016 E67.72257
G0 X-1.519 Y-.104
;TIME_ELAPSED:88.437532
G1 F2700 E64.22257
M104 S0
M140 S0
G28
M104 S0
;End of Gcode
;SETTING_3 {"global_quality": "[general]\\nversion = 2\\nname = Rostock Slow\\nd
;SETTING_3 efinition = custom\\n\\n[metadata]\\nquality_type = normal\\ntype = q
;SETTING_3 uality_changes\\n\\n[values]\\nadhesion_type = skirt\\nretraction_hop
;SETTING_3 _enabled = True\\nspeed_layer_0 = 25\\nsupport_z_distance = 0.2\\ninf
;SETTING_3 ill_sparse_density = 15\\ntop_layers = 5\\nspeed_slowdown_layers = 1\
;SETTING_3 \nspeed_wall = 40.0\\nmaterial_print_temperature = 210\\ncool_min_lay
;SETTING_3 er_time_fan_speed_max = 30\\nspeed_wall_0 = 35.0\\nspeed_topbottom = 
;SETTING_3 25.0\\nretraction_combing = off\\nskirt_brim_minimal_length = 0\\nmat
;SETTING_3 erial_bed_temperature = 60.0\\nsupport_angle = 50\\nskirt_gap = 0\\nl
;SETTING_3 ayer_height = 0.2\\ninfill_pattern = cubic\\nbrim_line_count = 3\\nre
;SETTING_3 traction_extra_prime_amount = 0\\nsupport_enable = False\\nbottom_lay
;SETTING_3 ers = 5\\nretraction_speed = 45\\nspeed_print = 40\\ncool_fan_full_la
;SETTING_3 yer = 2\\ncool_fan_speed_min = 75\\nretraction_amount = 3.5\\nwall_li
;SETTING_3 ne_count = 3\\nspeed_support = 40\\ngradual_infill_step_height = 2.0\
;SETTING_3 \ncool_fan_speed_max = 100\\ncool_min_layer_time = 20\\ngradual_infil
;SETTING_3 l_steps = 0\\nskirt_line_count = 0\\nmaterial_diameter = 1.75\\ninfil
;SETTING_3 l_before_walls = False\\nsupport_type = buildplate\\nspeed_travel = 1
;SETTING_3 50\\nz_seam_type = random\\nretraction_hop_only_when_collides = False
;SETTING_3 \\nspeed_travel_layer_0 = 150\\nspeed_wall_x = 40.0\\nsupport_pattern
;SETTING_3  = zigzag\\n\\n"}