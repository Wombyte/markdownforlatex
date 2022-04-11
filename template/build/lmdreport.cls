\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{build/lmdreport}[MWarkDown basis]

\LoadClass[10pt,fleqn,titlepage]{report}

% define image-folder
\usepackage{graphicx}
\graphicspath{ {./images/} }

% defining the eg symbol
\newcommand{\egsymbol}{
	\begingroup
	\normalfont\includegraphics[height=\fontcharht\font`\M]{egsymbol.png}%
	\endgroup
}

% mathmatical symbols
% eg black triangle for definitions
\RequirePackage{amsmath,amssymb}

% controll flow
\RequirePackage{ifthen}

% list environment
\RequirePackage{enumitem}
\newlist{notes}{enumerate}{3}
\setlist[notes,1]{
	label={\bf\arabic*.},
	leftmargin=30pt,
	topsep=2pt,
	itemsep=3pt,
	parsep=0pt
}
\setlist[notes,2]{
	label={\bf\roman*)},
	leftmargin=30pt,
	topsep=2pt,
	itemsep=3pt,
	parsep=0pt,
	before*=\small
}
\setlist[notes,3]{
	label={\bf\alph*)},
	leftmargin=30pt,
	topsep=2pt,
	itemsep=3pt,
	parsep=0pt,
	before*=\footnotesize
}

\newcommand{\numbullet}[1]{{\bf #1}}
\newcommand{\numhead}[1]{{\bf #1}}
\newcommand{\numbody}[1]{#1}
\newcommand{\num}[2][]{
	\item 
	\ifthenelse { \equal {#1} {} }
		{ }
		{\numhead{#1:}}
	{\numbody{#2}}
}

\makeatletter
\newcommand{\defineNoteCommand}[4]{
	\expandafter\def\csname #1bullet\endcsname##1{{\bf ##1}}
	\expandafter\def\csname #1head\endcsname##1{{#3 ##1:}}
	\expandafter\def\csname #1body\endcsname##1{{#4 ##1}}
	\expandafter\def\csname #1\endcsname{
		\@ifnextchar[%
			{\csname @#1WithHead\endcsname}
			{\csname @#1WithoutHead\endcsname}
	}
	\expandafter\def\csname @#1WithHead\endcsname[##1]##2{
		\item[\csname #1bullet\endcsname{#2}]\csname #1head\endcsname{##1}\csname #1body\endcsname{##2}
	}
	\expandafter\def\csname @#1WithoutHead\endcsname##1{
		\item[\csname #1bullet\endcsname{#2}]\csname #1body\endcsname{##1}
	}
}

\defineNoteCommand{note}{$\bullet$}{\bf}{} % ,
\defineNoteCommand{plus}{\textcolor{green}{+}}{\bf}{} % +
\defineNoteCommand{minus}{\textcolor{red}{-}}{\bf}{} % -
\defineNoteCommand{nota}{\ding{46}}{\bf}{} % !
\defineNoteCommand{theo}{$\circledast$}{\bf}{} % *
\defineNoteCommand{conc}{$\Rightarrow$}{\bf}{} % =>
\defineNoteCommand{lornote}{$\lor$}{\bf}{} %lor
\defineNoteCommand{landnote}{$\land$}{\bf}{} %land
\defineNoteCommand{expl}{\glqq\grqq}{\it}{\it} % "
\defineNoteCommand{smpl}{$\egsymbol$}{\it}{\it} % eg
\defineNoteCommand{blank}{}{}{} % [

\newcommand{\defipre}[1]{#1}
\newcommand{\defihead}[1]{\textbf{#1}}
\newcommand{\defibody}[1]{#1}
\newcommand{\defi}[3][]{ % >
	\item[$\blacktriangleright$] \defipre{#1} \defihead{#2} \defibody{#3}
}

% images
\RequirePackage[dvipsnames]{xcolor} % nec. for pic
\newcommand{\picname}[1]{#1.png}
\newcommand{\pic}[2]{
	\IfFileExists{./images/\picname{#1}}{
		\begin{minipage}{#2\textwidth}
			\includegraphics[width=\textwidth]{\picname{#1}}
		\end{minipage}
	}{\textcolor{red}{\picname{#1}}}
}